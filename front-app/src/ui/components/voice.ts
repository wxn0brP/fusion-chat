import { voiceHTML } from "#var/html";
import { mglVar } from "#var/mgl";
import { socket } from "#core/socket/socket";
import { apis } from "#api/apis";
import { uiFunc } from "../helpers/uiFunc";
import { vars } from "#var/var";
import { LangPkg, langFunc } from "#utils/translate";
import { Id } from "#types/Id";
import { core_debug, LogLevel } from "#core/debug";

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

export const voiceFunc = {
    async initCall() {
        try {
            voiceHTML.voiceShow.style.display = "";
            if (voiceFuncVar.local_stream) return;
            const stream = await this.getStream(true, false);
            voiceFuncVar.local_stream = stream;
            voiceHTML.div.fadeIn();
        } catch (error) {
            console.error('initCall', `Error joining voice channel: ${error.message}`);
        }
    },

    async joinToVoiceChannel(to: Id) {
        await this.initCall();
        voiceFuncVar.joined = to;
        socket.emit("voice.join", to);
        socket.emit("voice.get.users");
        voiceHTML.muteMic.innerHTML = voiceFuncVar.muteMic ? LangPkg.ui.mute.unmute : LangPkg.ui.mute.mute;
    },

    send() {
        if (voiceFuncVar.sending) return;

        let buffer = [];
        const mediaRecorder = new MediaRecorder(voiceFuncVar.local_stream, { mimeType: "video/webm; codecs=vp8,opus" });
        mediaRecorder.ondataavailable = (event) => {
            if (event.data.size == 0) return;
            buffer.push(event.data);
        };

        mediaRecorder.onstop = () => {
            if (buffer.length == 0) return core_debug.msg(LogLevel.WARN, "no voice data");

            socket.emit("voice.sendData", buffer);
            buffer = [];
        };

        voiceFuncVar.sending = setInterval(() => {
            mediaRecorder.stop();
            setTimeout(() => {
                if (!voiceFuncVar.sending) return;
                mediaRecorder.start();
            }, 10);
        }, 100);

        mediaRecorder.start(100);
    },

    endCall() {
        if (typeof voiceFuncVar.sending === "number") clearInterval(voiceFuncVar.sending);
        voiceFuncVar.sending = false;
        voiceFuncVar.joined = false;
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

        const isConfirm = await uiFunc.confirm(langFunc(LangPkg.ui.confirm.call_to, await apis.www.changeUserID(id)) + "?");
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
    core_debug.msg(LogLevel.INFO, "reconnected to voice channel");
    voiceFunc.joinToVoiceChannel(voiceFuncVar.joined as Id);
});

socket.on("voice.get.users", async (users: Id[]) => {
    voiceHTML.users.innerHTML = "";

    for (const user of users) {
        const li = document.createElement("li");
        li.innerHTML = await apis.www.changeUserID(user);
        voiceHTML.users.appendChild(li);
    }

    if (users.length > 1) {
        voiceFunc.send();
    } else if (users.length == 1) {
        if (typeof voiceFuncVar.sending === "number")
            clearInterval(voiceFuncVar.sending);
        voiceFuncVar.sending = false;
    }
});

socket.on("call.dm.init", async (id: Id, userOffline: boolean = false) => {
    if (userOffline) {
        uiFunc.uiMsgT(LangPkg.ui.call.offline, await apis.www.changeUserID(id));
        const join = confirm(LangPkg.ui.call.wait + "?");
        if (!join) return;
    } else { // if user is online
        if (voiceFunc.isInUserCall(id))
            return socket.emit("call.dm.answer", id, true);

        const isConfirm = confirm(langFunc(LangPkg.ui.call.called, await apis.www.changeUserID(id)) + "?");
        socket.emit("call.dm.answer", id, isConfirm);

        if (!isConfirm) return;
    }

    const room = "user_" + [id, vars.user._id].sort().join("=");
    voiceFunc.joinToVoiceChannel(room);
});

socket.on("call.dm.answer", async (id: Id, answer: boolean) => {
    if (!answer)
        return alert(LangPkg.ui.call.rejected);

    const isConfirm = confirm(langFunc(LangPkg.ui.call.answer, await apis.www.changeUserID(id)) + "?");
    if (!isConfirm) return;

    const room = "user_" + [id, vars.user._id].sort().join("=");
    voiceFunc.joinToVoiceChannel(room);
});

socket.on("voice.leave", async (id: Id) => {
    uiFunc.uiMsgT(LangPkg.ui.call.left, await apis.www.changeUserID(id));
});

socket.on("voice.join", async (to: Id) => {
    uiFunc.uiMsgT(LangPkg.ui.call.joined, await apis.www.changeUserID(to));
});

mglVar.voiceFunc = voiceFunc;