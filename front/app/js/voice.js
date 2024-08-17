const voiceHTML = {
    div: document.querySelector("#voice_call"),
    mediaContainer: document.querySelector("#voice_call_media"),
    users: document.querySelector("#voice_call_users"),
    muteMic: document.querySelector("#voice_call_mute_mic"),
    voiceShow: document.querySelector("#groups__voice_show"),
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

    log(level, action, message){
        if(!this.filters[level]) return;

        const time = new Date();
        const logEntry = { time, level: level.toUpperCase(), user: vars.user._id, action, message };
        
        if(this.logBuffer.length >= this.maxLogSize){
            this.logBuffer.shift();
        }
        this.logBuffer.push(logEntry);
        
        debugFunc.msg(`[${time.toLocaleTimeString()}] [${logEntry.level}] [Action: ${logEntry.action}] ${logEntry.message}`);
    },

    info(action, message){
        this.log('info', action, message);
    },

    warn(action, message){
        this.log('warn', action, message);
    },

    error(action, message){
        this.log('error', action, message);
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
        const id = voiceUtils.formatCallId(fr, to);
        voiceDebug.info(fr, 'initPeer', `Initializing peer connection; id: ${id}`);
        return new Peer(id, {
            secure: true,
            port: 443,
            restartIce: true,
        });
    },

    async getStream(audio=true, video=false){
        if(apis.app.apiType == "rn"){
            return await processMediaRN.getStream();
        }
        const stream = new MediaStream();

        async function getUserMedia(options){
            if(navigator.mediaDevices?.getUserMedia){
                return await navigator.mediaDevices.getUserMedia(options);
            }else if(navigator.webkitGetUserMedia){
                return await navigator.webkitGetUserMedia(options);
            }else if(navigator.mozGetUserMedia){
                return await navigator.mozGetUserMedia(options);
            }
        }

        async function selectDevice(devices, prompt){
            const labels = devices.map(device => device.label);
            const deviceIds = devices.map(device => device.deviceId);
            const selectedIndex = await uiFunc.selectPrompt(translateFunc.get(prompt), labels, deviceIds);
            return deviceIds[selectedIndex];
        }

        try{
            const permisons = await getUserMedia({ audio, video });
            if(!permisons){
                voiceDebug.error('getStream', 'No permissions to get stream');
                uiFunc.uiMsg(translateFunc.get('Error getting stream'));
                return stream;
            }
            setTimeout(() => {
                permisons.getTracks().forEach(track => track.stop());
            }, 100);

            const devices = await navigator.mediaDevices.enumerateDevices();
            const audioDevices = devices.filter(device => device.kind === 'audioinput');
            const videoDevices = devices.filter(device => device.kind === 'videoinput');

            const audioOptions = audio ? { deviceId: await selectDevice(audioDevices, 'Select audio device') } : false;
            const videoOptions = video ? { deviceId: await selectDevice(videoDevices, 'Select video device') } : false;

            const mediaStream = await getUserMedia({ audio: audioOptions, video: videoOptions });
            if(mediaStream)
                stream.addTrack(mediaStream.getAudioTracks()[0]);

            return stream;
        }catch(error){
            console.error(`Error getting stream: ${error.message}`);
            return stream;
        }
    },

    formatCallId(fromUserId, toUserId){
        return `${voiceConfig.prefix}${fromUserId}-2-${toUserId}`;
    },

    postSetupPeer(peer, to){
        peer.fc_data = {
            to,
            fr: vars.user._id
        }
        peer.on("open", () => {
            voiceDebug.info('postSetupPeer', `Peer connection opened; to: ${to}`);
        });

        peer.on("close", () => {
            voiceDebug.warn('postSetupPeer', `Peer connection closed; to: ${to}`);
        });
    }
}

const voiceFunc = {
    local_stream: new MediaStream(),
    peers: [],
    muteMic: false,

    async initCall(){
        try{
            const stream = await voiceUtils.getStream(true, false);
            voiceFunc.local_stream = stream;
            voiceHTML.div.fadeIn();
            voiceHTML.voiceShow.style.display = "";
        }catch(error){
            voiceDebug.error('initCall', `Error joining voice channel: ${error.message}`);
        }
    },

    async joinToVoiceChannel(to){
        await voiceFunc.initCall();
        socket.emit("joinVoiceChannel", to);
        socket.emit("getVoiceChannelUsers", to, true);
        voiceDebug.info('initCall', `Joined voice channel: ${to}`);
    },

    makeConnectionHandler(to){
        const peer = voiceUtils.initPeer(to, vars.user._id);
        voiceFunc.peers.push(peer);
        voiceUtils.postSetupPeer(peer, to);

        peer.on("call", (call) => {
            voiceDebug.info('makeConnectionHandler', `Incoming call; to: ${to}`);
            call.answer(voiceFunc.local_stream);

            call.on("stream", (stream) => {
                voiceFunc.addMediaHtml(stream, to);
                voiceDebug.info('makeConnectionHandler', `Stream received; to: ${to}`);
            });

            call.on("close", () => {
                voiceDebug.warn('makeConnectionHandler', `Call closed; to: ${to}`);
            });
        });

        return peer;
    },

    makeConnectionCaller(to){
        const peer = voiceUtils.initPeer(to, vars.user._id);
        voiceFunc.peers.push(peer);
        voiceUtils.postSetupPeer(peer, to);
        
        peer.on("open", () => {
            const id = voiceUtils.formatCallId(vars.user._id, to);
            const call = peer.call(id, voiceFunc.local_stream);
            voiceDebug.info('makeConnectionCaller', `Outgoing call to: ${id}`);
            call.on("stream", (stream) => {
                voiceFunc.addMediaHtml(stream, to);
                voiceDebug.info('makeConnectionCaller', `Stream received from call; to: ${to}`);
            });

            call.on("close", () => {
                voiceDebug.warn('makeConnectionCaller', `Call closed; to: ${to}`);
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
        voiceDebug.info('addMediaHtml', `Added media HTML for call: ${id}`);

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
        voiceHTML.voiceShow.style.display = "none";

        if(apis.app.apiType == "rn"){
            apis.api.send({
                type: "stopAudio",
            });
        }else{
            voiceFunc.local_stream.getTracks().forEach((track) => {
                track.stop();
            });
            voiceFunc.local_stream = new MediaStream();
        }
        voiceDebug.info('endCall', "Call ended and cleaned up.");

        socket.emit("callLogs", voiceDebug.getLogs());

        if(!debugFunc.isDebug){
            const isConfirm = confirm(translateFunc.get("Would you like to export the journal") + "?");
            if(isConfirm) voiceDebug.exportLogs();
        }
    },

    startCall(){
        const id = vars.chat.to.replace("$","");
        if(id == "main") return;

        const isConfirm = confirm(translateFunc.get("Are you sure you want to call $", apis.www.changeUserID(id)) + "?");
        if(!isConfirm) return;

        socket.emit("callToUser", id);
    },

    toggleMute(){
        voiceFunc.muteMic = !voiceFunc.muteMic;
        if(apis.app.apiType == "rn"){
            apis.api.send({
                type: voiceFunc.muteMic ? "stopAudio" : "startAudio",
            })
        }else{
            const tracks = voiceFunc.local_stream.getAudioTracks();
            tracks.forEach((track) => {
                track.enabled = !voiceFunc.muteMic;
            });
        }

        voiceDebug.info('toggleMute', `Mic ${voiceFunc.muteMic ? "muted" : "unmuted"}`);
        voiceHTML.muteMic.innerHTML = translateFunc.get(voiceFunc.muteMic ? "Unmute" : "Mute");
    }
}

socket.on("joinVoiceChannel", (to) => {
    voiceDebug.info('socket', `Handling joinVoiceChannel for ${to}`);
    voiceFunc.makeConnectionHandler(to);
});

socket.on("getVoiceChannelUsers", (users, make) => {
    if(make){
        users.forEach((to) => {
            if(to == vars.user._id) return;
    
            voiceDebug.info('socket', `Handling getVoiceChannelUsers for ${to}`);
            voiceFunc.makeConnectionCaller(to);
        });
    }

    voiceHTML.users.innerHTML = "";
    users.forEach((user) => {
        const li = document.createElement("li");
        li.innerHTML = apis.www.changeUserID(user);
        voiceHTML.users.appendChild(li);
    });
});

socket.on("callToUser", (id) => {
    const isConfirm = confirm(translateFunc.get("$ is calling you. Accept", apis.www.changeUserID(id)) + "?");
    socket.emit("callToUserAnswer", id, isConfirm);

    if(!isConfirm) return;

    voiceDebug.info('socket', `Handling callToUser for ${id}`);
    voiceFunc.joinToVoiceChannel(id + "=" + vars.user._id);
});

socket.on("callToUserAnswer", (id, answer) => {
    if(!answer){
        alert(translateFunc.get("Call rejected"));
        return;
    }

    voiceDebug.info('socket', `Handling callToUserAnswer for ${id}`);
    setTimeout(() => {
        voiceFunc.joinToVoiceChannel(vars.user._id + "=" + id);
    }, 1000);
});

socket.on("leaveVoiceChannel", (id) => {
    uiFunc.uiMsg(translateFunc.get("$ left the voice channel", apis.www.changeUserID(id)));
});