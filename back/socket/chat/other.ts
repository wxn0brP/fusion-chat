import db from "../../dataBase.js";
import { Id } from "../../types/base.js";
import Db_Mess from "../../types/db/mess.js";
import Status from "../../types/socket/chat/status.js";
import { Socket_StandardRes_Error } from "../../types/socket/res.js";
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

export default (socket) => {
    socket.onLimit("get.ogs", 1_000, async (link: string, cb: Function) => {
        try {
            const { err, res } = await get_ogs(link);
            if (err) return socket.emit(...err as Socket_StandardRes_Error[]);
            if (cb) cb(res);
            else socket.emit("get.ogs", res);
        } catch (e) {
            socket.logError(e);
        }
    });

    socket.onLimit("send.embed.og", 1_000, async (to: Id, chnl: Id, link: string) => {
        try {
            const { err } = await send_embed_og(socket.user, to, chnl, link);
            if (err) return socket.emit(...err as Socket_StandardRes_Error[]);
        } catch (e) {
            socket.logError(e);
        }
    });

    socket.onLimit("send.embed.data", 1_000, async (to: Id, chnl: Id, embed: Db_Mess.Embed) => {
        try {
            const { err } = await send_embed_data(socket.user, to, chnl, embed);
            if (err) return socket.emit(...err as Socket_StandardRes_Error[]);
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
            const { err } = await status_activity_set(socket.user, state);
            if (err) return socket.emit(...err as Socket_StandardRes_Error[]);
        } catch (e) {
            socket.logError(e);
        }
    });

    socket.onLimit("status.activity.get", 1_000, async (id: Id, cb?: Function) => {
        try {
            const { err, res } = await status_activity_get(id);
            if (err) return socket.emit(...err as Socket_StandardRes_Error[]);
            if (cb) cb(res);
            else socket.emit("status.activity.get", res);
        } catch (e) {
            socket.logError(e);
        }
    });

    socket.onLimit("status.activity.gets", 1_000, async (ids: Id[], cb?: Function) => {
        try {
            const { err, res } = await status_activity_gets(ids);
            if (err) return socket.emit(...err as Socket_StandardRes_Error[]);
            if (cb) cb(res);
            else socket.emit("status.activity.gets", res);
        } catch (e) {
            socket.logError(e);
        }
    });

    socket.onLimit("status.activity.remove", 1_000, async () => {
        try {
            const { err } = await status_activity_remove(socket.user);
            if (err) return socket.emit(...err as Socket_StandardRes_Error[]);
        } catch (e) {
            socket.logError(e);
        }
    });

    socket.onLimit("user.delete", 50_000, async () => {
        try {
            const { err } = await user_delete(socket.user);
            if (err) return socket.emit(...err as Socket_StandardRes_Error[]);
        } catch (e) {
            socket.logError(e);
        }
    });
}