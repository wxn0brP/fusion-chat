const voiceHTML = {
    div: document.querySelector("#voice_call"),
    mediaContainer: document.querySelector("#voice_call_media"),
}

const voiceConfig = {
    prefix: "FusionChat-",
}

const voiceDebug = {
    logBuffer: [],
    maxLogSize: 1000,
    filters: {
        info: true,
        warn: true,
        error: true
    },
    log(level, user, action, message){
        if(!this.filters[level]) return;

        const time = new Date();
        const logEntry = { time, level: level.toUpperCase(), user, action, message };
        
        if(this.logBuffer.length >= this.maxLogSize){
            this.logBuffer.shift();
        }
        this.logBuffer.push(logEntry);
        
        debugFunc.msg(`[${time.toLocaleTimeString()}] [${logEntry.level}] [User: ${logEntry.user}] [Action: ${logEntry.action}] ${logEntry.message}`);
    },
    info(user, action, message){
        this.log('info', user, action, message);
    },
    warn(user, action, message){
        this.log('warn', user, action, message);
    },
    error(user, action, message){
        this.log('error', user, action, message);
    },
    getLogs(){
        return this.logBuffer;
    },
    clearLogs(){
        this.logBuffer = [];
    },
    setFilter(level, state){
        this.filters[level] = state;
    },
    exportLogs(){
        const logData = JSON.stringify(this.logBuffer, null, 2);
        const blob = new Blob([logData], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `logs-${vars.user._id}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
}

const voiceUtils = {
    initPeer(fr, to){
        const id = voiceUtils.formatCallid(fr, to);
        voiceDebug.info(fr, 'initPeer', `Initializing peer connection; id: ${id}`);
        return new Peer(id, {
            secure: true,
            port: 443,
            restartIce: true,
        });
    },

    async getStream(obj){
        try{
            if(navigator.mediaDevices?.getUserMedia){
                return await navigator.mediaDevices.getUserMedia(obj);
            }else if(navigator.webkitGetUserMedia){
                return await navigator.webkitGetUserMedia(obj);
            }else if(navigator.mozGetUserMedia){
                return await navigator.mozGetUserMedia(obj);
            }else{
                throw new Error("getUserMedia not supported");
            }
        }catch(error){
            voiceDebug.error('unknown', 'getStream', `Error getting stream: ${error.message}`);
            return new MediaStream();
        }
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
            voiceDebug.info(vars.user._id, 'postSetupPeer', `Peer connection opened; to: ${to}`);
        });

        peer.on("close", () => {
            voiceDebug.warn(vars.user._id, 'postSetupPeer', `Peer connection closed; to: ${to}`);
            uiFunc.uiMsg(translateFunc.get("User $ has left", apis.www.changeUserID(to)) + ".");
        });
    }
}

const voiceFunc = {
    local_stream: new MediaStream(),
    peers: [],

    async initCall(){
        try{
            const stream = await voiceUtils.getStream({ audio: true, video: false });
            voiceFunc.local_stream = stream;
            voiceHTML.div.style.display = "block";
        }catch(error){
            voiceDebug.error(vars.user._id, 'initCall', `Error joining voice channel: ${error.message}`);
        }
    },

    async joinToVoiceChannel(to){
        await voiceFunc.initCall();
        socket.emit("joinVoiceChannel", to);
        socket.emit("getVoiceChannelUsers", to);
        voiceDebug.info(vars.user._id, 'initCall', `Joined voice channel: ${to}`);
    },

    makeConnectionHandler(to){
        const peer = voiceUtils.initPeer(to, vars.user._id);
        voiceFunc.peers.push(peer);
        voiceUtils.postSetupPeer(peer, to);

        peer.on("call", (call) => {
            voiceDebug.info(vars.user._id, 'makeConnectionHandler', `Incoming call; to: ${to}`);
            call.answer(voiceFunc.local_stream);

            call.on("stream", (stream) => {
                voiceFunc.addMediaHtml(stream, to);
                voiceDebug.info(vars.user._id, 'makeConnectionHandler', `Stream received; to: ${to}`);
            });

            call.on("close", () => {
                voiceDebug.warn(vars.user._id, 'makeConnectionHandler', `Call closed; to: ${to}`);
                uiFunc.uiMsg(translateFunc.get("User $ has left", apis.www.changeUserID(to)) + ".");
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
            voiceDebug.info(vars.user._id, 'makeConnectionCaller', `Outgoing call to: ${id}`);
            call.on("stream", (stream) => {
                voiceFunc.addMediaHtml(stream, to);
                voiceDebug.info(vars.user._id, 'makeConnectionCaller', `Stream received from call; to: ${to}`);
            });

            call.on("close", () => {
                voiceDebug.warn(vars.user._id, 'makeConnectionCaller', `Call closed; to: ${to}`);
                uiFunc.uiMsg(translateFunc.get("User $ has left", apis.www.changeUserID(to)) + ".");
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
        voiceDebug.info(vars.user._id, 'addMediaHtml', `Added media HTML for call: ${id}`);

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
        voiceDebug.info(vars.user._id, 'endCall', "Call ended and cleaned up.");

        socket.emit("callLogs", voiceDebug.getLogs());
        const isConfirm = confirm(translateFunc.get("Would you like to export the journal") + "?");
        if(isConfirm) voiceDebug.exportLogs();

    },

    startCall(){
        const id = vars.chat.to.replace("$","");
        if(id == "main") return;

        const isConfirm = confirm(translateFunc.get("Are you sure you want to call $", apis.www.changeUserID(id)) + "?");
        if(!isConfirm) return;

        socket.emit("callToUser", id);
    }
}

socket.on("joinVoiceChannel", (to) => {
    voiceDebug.info(vars.user._id, 'socket', `Handling joinVoiceChannel for ${to}`);
    voiceFunc.makeConnectionHandler(to);
});

socket.on("getVoiceChannelUsers", (tos) => {
    tos.forEach((to) => {
        if(to == vars.user._id) return;

        voiceDebug.info(vars.user._id, 'socket', `Handling getVoiceChannelUsers for ${to}`);
        voiceFunc.makeConnectionCaller(to);
    });
});

socket.on("callToUser", (id) => {
    const isConfirm = confirm(translateFunc.get("$ is calling you. Accept", apis.www.changeUserID(id)) + "?");
    socket.emit("callToUserAnswer", id, isConfirm);

    if(!isConfirm) return;

    voiceDebug.info(vars.user._id, 'socket', `Handling callToUser for ${id}`);
    voiceFunc.initCall();
    voiceFunc.makeConnectionHandler(id);
});

socket.on("callToUserAnswer", (id, answer) => {
    if(!answer){
        alert(translateFunc.get("Call rejected"));
        return;
    }

    voiceDebug.info(vars.user._id, 'socket', `Handling callToUserAnswer for ${id}`);
    voiceFunc.initCall();
    setTimeout(() => {
        voiceFunc.makeConnectionCaller(id);
    }, 1000);
});