import hub from "../../hub";
hub("components/voice");

import { voiceHTML } from "../../var/html";
import { mglVar } from "../../var/mgl";
import socket from "../../core/socket/socket";
import apis from "../../api/apis";
import uiFunc from "../helpers/uiFunc";
import vars from "../../var/var";
import LangPkg, { langFunc } from "../../utils/translate";
import Id from "../../types/Id";

interface voiceFuncVar {
    local_stream: null | MediaStream;
    muteMic: boolean;
    sending: boolean | number;
    joined: boolean | string;
}

const voiceFuncVar: voiceFuncVar = {
    local_stream: null,
    muteMic: false,
    sending: false,
    joined: false,
}

const voiceFunc = {
    async initCall() {
        try {
            voiceHTML.voiceShow.style.display = "";
            if (this.local_stream) return;
            const stream = await this.getStream(true, false);
            voiceFuncVar.local_stream = stream;
            voiceHTML.div.fadeIn();
        } catch (error) {
            console.error('initCall', `Error joining voice channel: ${error.message}`);
        }
    },

    async joinToVoiceChannel(to: Id) {
        await this.initCall();
        this.joined = to;
        socket.emit("voice.join", to);
        socket.emit("voice.get.users");
        voiceHTML.muteMic.innerHTML = voiceFuncVar.muteMic ? LangPkg.ui.mute.unmute : LangPkg.ui.mute.mute;
    },

    send() {
        if (this.sending) return;
        const _this = this;

        let buffer = [];
        const mediaRecorder = new MediaRecorder(this.local_stream, { mimeType: "video/webm; codecs=vp8,opus" });
        mediaRecorder.ondataavailable = (event) => {
            if (event.data.size == 0) return;
            buffer.push(event.data);
        };

        mediaRecorder.onstop = () => {
            if (buffer.length == 0) return lo("no voice data");

            socket.volatile.emit("voice.sendData", buffer);
            buffer = [];
        };

        this.sending = setInterval(() => {
            mediaRecorder.stop();
            setTimeout(() => {
                if (!_this.sending) return;
                mediaRecorder.start();
            }, 10);
        }, 100);

        mediaRecorder.start(100);
    },

    endCall() {
        if (this.sending) clearInterval(this.sending);
        this.sending = false;
        this.joined = false;
        socket.emit("voice.leave");

        voiceHTML.div.fadeOut();
        voiceHTML.mediaContainer.innerHTML = "";
        voiceHTML.voiceShow.style.display = "none";

        if (apis.app.apiType == "rn") {
            apis.api.send({
                type: "stopAudio",
            });
        } else {
            voiceFuncVar.local_stream.getTracks().forEach((track) => {
                track.stop();
            });
            voiceFuncVar.local_stream = null;
        }
    },

    async startCall() {
        const id = vars.chat.to.replace("$", "");
        if (id == "main") return;

        const isConfirm = await uiFunc.confirm(langFunc(LangPkg.ui.confirm.call_to, apis.www.changeUserID(id)) + "?");
        if (!isConfirm) return;

        socket.emit("call.dm.init", id);
    },

    toggleMute() {
        voiceFuncVar.muteMic = !voiceFuncVar.muteMic;
        if (apis.app.apiType == "rn") {
            apis.api.send({
                type: voiceFuncVar.muteMic ? "stopAudio" : "startAudio",
            })
        } else {
            const tracks = voiceFuncVar.local_stream.getAudioTracks();
            tracks.forEach((track) => {
                track.enabled = !voiceFuncVar.muteMic;
            });
        }

        voiceHTML.muteMic.innerHTML = voiceFuncVar.muteMic ? LangPkg.ui.mute.unmute : LangPkg.ui.mute.mute;
    },

    async getStream(audio: boolean = true, video: boolean = false): Promise<MediaStream> {
        if (apis.app.apiType === "rn") {
            // React Native only
            return await (window as any).processMediaRN.getStream() as MediaStream;
        }

        const stream = new MediaStream();

        async function getUserMedia(options: {
            audio?: { deviceId?: string } | boolean,
            video?: { deviceId?: string } | boolean
        }): Promise<MediaStream | undefined> {
            if (navigator.mediaDevices?.getUserMedia) {
                return await navigator.mediaDevices.getUserMedia(options);
            } else if ("webkitGetUserMedia" in navigator) {
                const webkitGetUserMedia = (navigator as any).webkitGetUserMedia.bind(navigator);
                return new Promise<MediaStream>((resolve, reject) => {
                    webkitGetUserMedia(options, resolve, reject);
                });
            } else if ("mozGetUserMedia" in navigator) {
                const mozGetUserMedia = (navigator as any).mozGetUserMedia.bind(navigator);
                return new Promise<MediaStream>((resolve, reject) => {
                    mozGetUserMedia(options, resolve, reject);
                });
            }
        }

        async function selectDevice(
            devices: MediaDeviceInfo[],
            prompt: string
        ): Promise<string | undefined> {
            if (devices.length === 0) {
                uiFunc.uiMsgT('No devices found');
                return undefined;
            }
            const labels = devices.map(device => device.label || "Unknown Device");
            const deviceIds = devices.map(device => device.deviceId);
            const selectedIndex = await uiFunc.selectPrompt(prompt, labels, deviceIds) as number;
            return deviceIds[selectedIndex];
        }

        try {
            const permissions = await getUserMedia({ audio, video });
            if (!permissions) {
                uiFunc.uiMsgT('Error getting temporary stream');
                return stream;
            }

            setTimeout(() => {
                permissions.getTracks().forEach(track => track.stop());
            }, 200);

            const devices = await navigator.mediaDevices.enumerateDevices();
            const audioDevices = devices.filter(device => device.kind === 'audioinput');
            const videoDevices = devices.filter(device => device.kind === 'videoinput');

            const audioOptions = audio
                ? { deviceId: await selectDevice(audioDevices, LangPkg.ui.call.select_audio_device) }
                : false;

            const videoOptions = video
                ? { deviceId: await selectDevice(videoDevices, LangPkg.ui.call.select_video_device) }
                : false;

            const mediaStream = await getUserMedia({ audio: audioOptions, video: videoOptions });
            if (mediaStream) {
                mediaStream.getTracks().forEach(track => stream.addTrack(track));
            }

            return stream;
        } catch (error) {
            console.error(`Error getting stream: ${(error as Error).message}`);
            uiFunc.uiMsgT('An error occurred while getting the stream');
            return stream;
        }
    },

    isInUserCall(id: Id) {
        const room = "user_" + [id, vars.user._id].sort().join("=");
        return room == voiceFuncVar.joined;
    }
}

socket.on("voice.sendData", (from: Id, data: any) => {
    const blob = new Blob(data, { type: "audio/webm; codecs=vp8,opus" });
    const url = URL.createObjectURL(blob);
    const audio = new Audio(url);
    audio.play().catch(() => { });
});

socket.on("connect", () => {
    if (!voiceFuncVar.joined) return;
    lo("reconnected to voice channel");
    voiceFunc.joinToVoiceChannel(voiceFuncVar.joined as Id);
});

socket.on("voice.get.users", (users: Id[]) => {
    voiceHTML.users.innerHTML = "";
    users.forEach((user) => {
        const li = document.createElement("li");
        li.innerHTML = apis.www.changeUserID(user);
        voiceHTML.users.appendChild(li);
    });

    if (users.length > 1) {
        voiceFunc.send();
    } else if (users.length == 1) {
        clearInterval(voiceFuncVar.sending as number);
        voiceFuncVar.sending = false;
    }
});

socket.on("call.dm.init", (id: Id, userOffline: boolean = false) => {
    if (userOffline) {
        uiFunc.uiMsgT(LangPkg.ui.call.offline, apis.www.changeUserID(id));
        const join = confirm(LangPkg.ui.call.wait + "?");
        if (!join) return;
    } else { // if user is online
        if (voiceFunc.isInUserCall(id))
            return socket.emit("call.dm.answer", id, true);

        const isConfirm = confirm(langFunc(LangPkg.ui.call.called, apis.www.changeUserID(id)) + "?");
        socket.emit("call.dm.answer", id, isConfirm);

        if (!isConfirm) return;
    }

    const room = "user_" + [id, vars.user._id].sort().join("=");
    voiceFunc.joinToVoiceChannel(room);
});

socket.on("call.dm.answer", (id: Id, answer: boolean) => {
    if (!answer)
        return alert(LangPkg.ui.call.rejected);

    const isConfirm = confirm(langFunc(LangPkg.ui.call.answer, apis.www.changeUserID(id)) + "?");
    if (!isConfirm) return;

    const room = "user_" + [id, vars.user._id].sort().join("=");
    voiceFunc.joinToVoiceChannel(room);
});

socket.on("voice.leave", (id: Id) => {
    uiFunc.uiMsgT(LangPkg.ui.call.left, apis.www.changeUserID(id));
});

socket.on("voice.join", (to: Id) => {
    uiFunc.uiMsgT(LangPkg.ui.call.joined, apis.www.changeUserID(to));
});

export default voiceFunc;
mglVar.voiceFunc = voiceFunc;