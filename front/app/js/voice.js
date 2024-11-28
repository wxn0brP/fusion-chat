const voiceHTML = {
    div: document.querySelector("#voice_call"),
    mediaContainer: document.querySelector("#voice_call_media"),
    users: document.querySelector("#voice_call_users"),
    muteMic: document.querySelector("#voice_call_mute_mic"),
    voiceShow: document.querySelector("#realms__voice_show"),
}

const voiceFunc = {
    local_stream: null,
    muteMic: false,
    sending: false,
    joined: false,

    async initCall(){
        try{
            voiceHTML.voiceShow.style.display = "";
            if(this.local_stream) return;
            const stream = await this.getStream(true, false);
            voiceFunc.local_stream = stream;
            voiceHTML.div.fadeIn();
        }catch(error){
            console.error('initCall', `Error joining voice channel: ${error.message}`);
        }
    },

    async joinToVoiceChannel(to){
        await this.initCall();
        this.joined = to;
        socket.emit("voice.join", to);
        socket.emit("voice.get.users");
    },

    send(){
        if(this.sending) return;
        const _this = this;

        let buffer = [];
        const mediaRecorder = new MediaRecorder(this.local_stream, { mimeType: "video/webm; codecs=vp8,opus" });
        mediaRecorder.ondataavailable = (event) => {
            if(event.data.size == 0) return;
            buffer.push(event.data);
        };

        mediaRecorder.onstop = () => {
            if(buffer.length == 0) return lo("no voice data");

            socket.volatile.emit("voice.sendData", buffer);
            buffer = [];
        };

        this.sending = setInterval(() => {
            mediaRecorder.stop();
            setTimeout(() => {
                if(!_this.sending) return;
                mediaRecorder.start();
            }, 10);
        }, 100);

        mediaRecorder.start(100);
    },

    // addMediaHtml(stream, id){
    //     const audio = document.createElement("audio");
    //     audio.srcObject = stream;
    //     audio.id = "audio_call_"+id;
    //     audio.setAttribute("controls", "");
    //     audio.setAttribute("autoplay", "");
    //     audio.style.display = "none";

    //     voiceHTML.mediaContainer.appendChild(audio);

    //     return audio;
    // },

    endCall(){
        if(this.sending) clearInterval(this.sending);
        this.sending = false;
        this.joined = false;
        socket.emit("voice.leave");

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
            voiceFunc.local_stream = null;
        }
    },

    startCall(){
        const id = vars.chat.to.replace("$","");
        if(id == "main") return;

        const isConfirm = confirm(translateFunc.get("Are you sure you want to call $", apis.www.changeUserID(id)) + "?");
        if(!isConfirm) return;

        socket.emit("call.dm.init", id);
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

        voiceHTML.muteMic.innerHTML = translateFunc.get(voiceFunc.muteMic ? "Unmute" : "Mute");
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

    isInUserCall(id){
        const room = "user_" + [id, vars.user._id].sort().join("=");
        return room == voiceFunc.joined;
    }
}

socket.on("voice.sendData", (from, data) => {
    const blob = new Blob(data, { type: "audio/webm; codecs=vp8,opus" });
    const url = URL.createObjectURL(blob);
    const audio = new Audio(url);
    audio.play().catch(() => {});
});

socket.on("connect", () => {
    if(!voiceFunc.joined) return;
    lo("reconnected to voice channel");
    voiceFunc.joinToVoiceChannel(voiceFunc.joined);
});

socket.on("voice.get.users", (users) => {
    voiceHTML.users.innerHTML = "";
    users.forEach((user) => {
        const li = document.createElement("li");
        li.innerHTML = apis.www.changeUserID(user);
        voiceHTML.users.appendChild(li);
    });

    if(users.length > 1){
        voiceFunc.send();
    }else if(users.length == 1){
        clearInterval(voiceFunc.sending);
        voiceFunc.sending = false;
    }
});

socket.on("call.dm.init", (id, userOffline=false) => {
    if(userOffline){
        alert(translateFunc.get("$ is offline", apis.www.changeUserID(id)));
        const join = confirm(translateFunc.get("Do you want join to call and wait") + "?");
        if(!join) return;
    }else{ // if user is online
        if(voiceFunc.isInUserCall(id))
            return socket.emit("call.dm.answer", id, true);
        
        const isConfirm = confirm(translateFunc.get("$ is calling you. Accept", apis.www.changeUserID(id)) + "?");
        socket.emit("call.dm.answer", id, isConfirm);
    
        if(!isConfirm) return;
    }

    const room = "user_" + [id, vars.user._id].sort().join("=");
    voiceFunc.joinToVoiceChannel(room);
});

socket.on("call.dm.answer", (id, answer) => {
    if(!answer)
        return alert(translateFunc.get("Call rejected"));

    const isConfirm = confirm(translateFunc.get("$ accepted your call. Join in this device", apis.www.changeUserID(id)) + "?");
    if(!isConfirm) return;

    const room = "user_" + [id, vars.user._id].sort().join("=");
    voiceFunc.joinToVoiceChannel(room);
});

socket.on("voice.leave", (id) => {
    uiFunc.uiMsg(translateFunc.get("$ left the voice channel", apis.www.changeUserID(id)));
});

socket.on("voice.join", (to) => {
    uiFunc.uiMsg(translateFunc.get("$ joined the voice channel", apis.www.changeUserID(to)));
});