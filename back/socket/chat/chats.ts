import { Id } from "../../types/base.js";
import { Socket_StandardRes_Error } from "../../types/socket/res.js";
import {
    realm_create,
    realm_exit,
    realm_get,
    realm_join,
    realm_mute,
    dm_block,
    dm_create,
    dm_get,
} from "./logic/chats.js";

export default (socket) => {
    socket.onLimit("realm.get", 100, async (cb?: Function) => {
        try {
            const { err, res } = await realm_get(socket.user);
            if (err) return socket.emit(...err as Socket_StandardRes_Error[]);
            if (cb) cb(res);
            else socket.emit("realm.get", res);
        } catch (e) {
            socket.logError(e);
        }
    });

    socket.onLimit("dm.get", 100, async (cb?: Function) => {
        try {
            const { err, res } = await dm_get(socket.user);
            if (err) return socket.emit(...err as Socket_StandardRes_Error[]);
            if (cb) cb(...res);
            else socket.emit("dm.get", ...res);
        } catch (e) {
            socket.logError(e);
        }
    });

    socket.onLimit("realm.create", 1000, async (name: string, cb?: Function) => {
        try {
            const { err, res } = await realm_create(socket.user, name);
            if (err) return socket.emit(...err as Socket_StandardRes_Error[]);
            if (cb) cb(res);
            else socket.emit("realm.create", res);
        } catch (e) {
            socket.logError(e);
        }
    });

    socket.onLimit("realm.exit", 1000, async (id: Id) => {
        try {
            const { err } = await realm_exit(socket.user, id);
            if (err) return socket.emit(...err as Socket_StandardRes_Error[]);
        } catch (e) {
            socket.logError(e);
        }
    });

    socket.onLimit("dm.create", 1000, async (name: string) => {
        try {
            const { err } = await dm_create(socket.user, name);
            if (err) return socket.emit(...err as Socket_StandardRes_Error[]);
        } catch (e) {
            socket.logError(e);
        }
    });

    socket.onLimit("realm.join", 1000, async (id: Id) => {
        try {
            const { err } = await realm_join(socket.user, id);
            if (err) return socket.emit(...err as Socket_StandardRes_Error[]);
        } catch (e) {
            socket.logError(e);
        }
    });

    socket.onLimit("realm.mute", 1000, async (id: Id, time: number) => {
        try {
            if (!socket.user) return socket.emit("error", "not auth");
            const { err } = await realm_mute(socket.user, id, time);
            if (err) return socket.emit(...err as Socket_StandardRes_Error[]);
        } catch (e) {
            socket.logError(e);
        }
    });

    socket.onLimit("dm.block", 1000, async (id: Id, blocked: boolean) => {
        try {
            const { err } = await dm_block(socket.user, id, blocked);
            if (err) return socket.emit(...err as Socket_StandardRes_Error[]);
        } catch (e) {
            socket.logError(e);
        }
    });
}