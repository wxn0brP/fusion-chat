import { Socket } from "socket.io";
import { Id } from "../../types/base.js";
import {
    voice_getUsers,
    voice_join,
    voice_sendData,
    leaveVoiceChannel,
    call_dm_answer,
    call_dm_init,
} from "./logic/voice.js";

export default (socket: Socket) => {
    socket.voiceRoom = null;
    socket.onLimit("voice.join", 100, async (to: Id) => {
        try {
            const data = await voice_join(socket, to);
            socket.processSocketError(data);
        } catch (e) {
            socket.logError(e);
        }
    });

    socket.onLimit("voice.sendData", 50, async (data: any) => {
        try {
            voice_sendData(socket.user, socket.voiceRoom, data);
        } catch (e) {
            socket.logError(e);
        }
    });

    socket.onLimit("voice.leave", 100, async () => {
        try {
            leaveVoiceChannel(socket);
        } catch (e) {
            socket.logError(e);
        }
    });

    socket.on("disconnect", () => {
        try {
            leaveVoiceChannel(socket);
        } catch (e) {
            socket.logError(e);
        }
    })

    socket.onLimit("voice.get.users", 100, (cb?: Function) => {
        try {
            const data = voice_getUsers(socket);
            if (socket.processSocketError(data)) return;
            if (cb) cb(data.res);
            else socket.emit("voice.get.users", data.res);
        } catch (e) {
            socket.logError(e);
        }
    });

    socket.onLimit("call.dm.init", 100, async (id: Id, cb?: Function) => {
        try {
            const data = await call_dm_init(socket.user, id);
            if (socket.processSocketError(data)) return;

            if (!data.res) return;
            if (cb) cb(id, true);
            else socket.emit("call.dm.init", id, true);
        } catch (e) {
            socket.logError(e);
        }
    });

    socket.onLimit("call.dm.answer", 100, async (id: Id, answer: boolean = false) => {
        try {
            const data = await call_dm_answer(socket.user, id, answer);
            socket.processSocketError(data);
        } catch (e) {
            socket.logError(e);
        }
    });
}