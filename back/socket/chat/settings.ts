import { Socket_StandardRes_Error } from "../../types/socket/res.js";
import {
    self_status_get,
    self_status_update,
    profile_set_nickname,
} from "./logic/settings.js";

export default (socket) => {
    socket.onLimit("self.status.update", 1000, async (status: string, text: string) => {
        try {
            const { err } = await self_status_update(socket.user, status, text);
            if (err) return socket.emit(...err as Socket_StandardRes_Error[]);
        } catch (e) {
            socket.logError(e);
        }
    });

    socket.onLimit("self.status.get", 100, async (cb?: Function) => {
        try {
            const { err, res } = await self_status_get(socket.user);
            if (err) return socket.emit(...err as Socket_StandardRes_Error[]);
            if (cb) cb(...res);
            else socket.emit("self.status.get", ...res);
        } catch (e) {
            socket.logError(e);
        }
    });

    socket.onLimit("profile.set_nickname", 100, async (nickname: string) => {
        try {
            const { err } = await profile_set_nickname(socket.user, nickname);
            if (err) return socket.emit(...err as Socket_StandardRes_Error[]);
        } catch (e) {
            socket.logError(e);
        }
    });
}