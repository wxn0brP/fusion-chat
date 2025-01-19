import { Socket } from "socket.io";
import {
    self_status_get,
    self_status_update,
    profile_set_nickname,
} from "./logic/settings";

export default (socket: Socket) => {
    socket.onLimit("self.status.update", 1000, async (status: string, text: string) => {
        try {
            const data = await self_status_update(socket.user, status, text);
            socket.processSocketError(data);
        } catch (e) {
            socket.logError(e);
        }
    });

    socket.onLimit("self.status.get", 100, async (cb?: Function) => {
        try {
            const data = await self_status_get(socket.user);
            if (socket.processSocketError(data)) return;
            if (cb) cb(...data.res);
            else socket.emit("self.status.get", ...data.res);
        } catch (e) {
            socket.logError(e);
        }
    });

    socket.onLimit("profile.set_nickname", 100, async (nickname: string) => {
        try {
            const data = await profile_set_nickname(socket.user, nickname);
            socket.processSocketError(data);
        } catch (e) {
            socket.logError(e);
        }
    });
}