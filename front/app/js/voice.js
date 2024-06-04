const voiceHTML = {
    div: document.querySelector("#voice_call"),
    mediaContainer: document.querySelector("#voice_call_media"),
}

const voiceConfig = {
    prefix: "FusionChat-",
}

const voiceUtils = {
    initPeer(fr, to){
        const id = voiceUtils.formatCallid(fr, to);
        debugFunc.msg("init peer conn; id: " + id);
        return new Peer(id, {
            secure: true,
            port: 443,
            restartIce: true,
        });
    },

    async getStream(obj){
        if(navigator.mediaDevices?.getUserMedia) return await navigator.mediaDevices.getUserMedia(obj);
        else if(navigator.webkitGetUserMedia) return await navigator.webkitGetUserMedia(obj);
        else if(navigator.mozGetUserMedia) return await nnavigator.mozGetUserMedia(obj);
        else return new MediaStream();
    },

    formatCallid(fr, to){
        return voiceConfig.prefix + fr + "-2-" + to;
    },

    postSetupPeer(peer, to){
        peer.fc_data = {
            to,
            fr: vars.user._id
        }
        peer.on("open", () => {
            debugFunc.msg("open peer; to: "+to + "; fr: "+vars.user._id);
        });

        peer.on("close", () => {
            debugFunc.msg("close peer; to: "+to + "; fr: "+vars.user._id);
        });
    }
}

const voiceFunc = {
    local_stream: new MediaStream(),
    peers: [],

    async joinToVoiceChannel(to){
        const stream = await voiceUtils.getStream({ audio: true, video: false });
        voiceFunc.local_stream = stream;
        
        socket.emit("joinVoiceChannel", to);
        socket.emit("getVoiceChannelUsers", to);
        voiceHTML.div.fadeIn();
    },

    makeConnectionHandler(to){
        const peer = voiceUtils.initPeer(to, vars.user._id);
        voiceFunc.peers.push(peer);
        voiceUtils.postSetupPeer(peer, to);

        peer.on("call", (call) => {
            debugFunc.msg("call mkh; to: "+to + "; fr: "+vars.user._id);
            call.answer(voiceFunc.local_stream);

            call.on("stream", (stream) => {
                voiceFunc.addMediaHtml(stream, to);
                debugFunc.msg("call stream mkh; to: "+to + "; fr: "+vars.user._id);
            });
        });

        return peer;
    },

    makeConnectionCaller(to){
        const peer = voiceUtils.initPeer(to, vars.user._id);
        voiceFunc.peers.push(peer);
        voiceUtils.postSetupPeer(peer, to);
        
        peer.on("open", () => {
            const id = voiceUtils.formatCallid(vars.user._id, to);
            const call = peer.call(id, voiceFunc.local_stream);
            debugFunc.msg("call to: "+id+"; fr: "+peer._id);
            call.on("stream", (stream) => {
                voiceFunc.addMediaHtml(stream, to);
                debugFunc.msg("call stream mkc; to: "+to + "; fr: "+vars.user._id);
            });
        })

        return peer;
    },

    addMediaHtml(stream, id){
        const audio = document.createElement("audio");
        audio.srcObject = stream;
        audio.id = "audio_call_"+id;
        audio.setAttribute("controls", "");
        audio.setAttribute("autoplay", "");
        audio.style.display = "none";

        voiceHTML.mediaContainer.appendChild(audio);

        return audio;
    },

    endCall(){
        voiceFunc.peers.forEach((peer) => {
            peer.destroy();
        });
        socket.emit("leaveVoiceChannel");

        voiceFunc.peers = [];
        voiceHTML.div.fadeOut();
        voiceHTML.mediaContainer.innerHTML = "";

        voiceFunc.local_stream.getTracks().forEach((track) => {
            track.stop();
        });
        voiceFunc.local_stream = new MediaStream();
    }
}

socket.on("joinVoiceChannel", (to) => {
    debugFunc.msg("makeConnectionHandler " + to);
    voiceFunc.makeConnectionHandler(to);
});

socket.on("getVoiceChannelUsers", (tos) => {
    tos.forEach((to) => {
        if(to == vars.user._id) return;

        debugFunc.msg("makeConnectionCaller " + to);
        voiceFunc.makeConnectionCaller(to);
    });
});