import { Socket } from "socket.io";
import db from "../../dataBase.js";
import { Id } from "../../types/base.js";
import Db_Mess from "../../types/db/mess.js";
import Status from "../../types/socket/chat/status.js";
import {
    get_ogs,
    send_embed_og,
    send_embed_data,
    fireToken_get,
    status_activity_set,
    status_activity_get,
    status_activity_gets,
    status_activity_remove,
    user_delete
} from "./logic/other.js";

export default (socket: Socket) => {
    socket.onLimit("get.ogs", 1_000, async (link: string, cb: Function) => {
        try {
            const data = await get_ogs(link);
            if (socket.processSocketError(data)) return;
            if (cb) cb(data.res);
            else socket.emit("get.ogs", data.res);
        } catch (e) {
            socket.logError(e);
        }
    });

    socket.onLimit("send.embed.og", 1_000, async (to: Id, chnl: Id, link: string) => {
        try {
            const data = await send_embed_og(socket.user, to, chnl, link);
            socket.processSocketError(data);
        } catch (e) {
            socket.logError(e);
        }
    });

    socket.onLimit("send.embed.data", 1_000, async (to: Id, chnl: Id, embed: Db_Mess.Embed) => {
        try {
            const data = await send_embed_data(socket.user, to, chnl, embed);
            socket.processSocketError(data);
        } catch (e) {
            socket.logError(e);
        }
    });

    socket.onLimit("fireToken.get", 1_000, async (cb?: Function) => {
        try {
            const res = await fireToken_get(socket.user, socket.handshake.auth.token);
            if (cb) cb(res);
            else socket.emit("fireToken.get", res);
        } catch (e) {
            socket.logError(e);
        }
    });

    socket.on("logout", async (cb?: Function) => {
        const token = socket.handshake.auth.token;
        db.data.removeOne("token", { token });
        db.data.removeOne("fireToken", { fc: token });
        socket.user = null;
        if (cb) cb();
        setTimeout(() => {
            if (socket.connected) socket.disconnect();
        }, 100);
    });

    socket.onLimit("status.activity.set", 1_000, async (state: Status) => {
        try {
            const data = await status_activity_set(socket.user, state);
            socket.processSocketError(data);
        } catch (e) {
            socket.logError(e);
        }
    });

    socket.onLimit("status.activity.get", 1_000, async (id: Id, cb?: Function) => {
        try {
            const data = await status_activity_get(id);
            if (socket.processSocketError(data)) return;
            if (cb) cb(data.res);
            else socket.emit("status.activity.get", data.res);
        } catch (e) {
            socket.logError(e);
        }
    });

    socket.onLimit("status.activity.gets", 1_000, async (ids: Id[], cb?: Function) => {
        try {
            const data = await status_activity_gets(ids);
            if (socket.processSocketError(data)) return;
            if (cb) cb(data.res);
            else socket.emit("status.activity.gets", data.res);
        } catch (e) {
            socket.logError(e);
        }
    });

    socket.onLimit("status.activity.remove", 1_000, async () => {
        try {
            const data = await status_activity_remove(socket.user);
            socket.processSocketError(data);
        } catch (e) {
            socket.logError(e);
        }
    });

    socket.onLimit("user.delete", 50_000, async () => {
        try {
            const data = await user_delete(socket.user);
            socket.processSocketError(data);
        } catch (e) {
            socket.logError(e);
        }
    });
}