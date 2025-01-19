import { Socket } from "socket.io";
import { Id } from "../../types/base";
import {
    realm_create,
    realm_exit,
    realm_get,
    realm_join,
    realm_mute,
    dm_block,
    dm_create,
    dm_get,
} from "./logic/chats";

export default (socket: Socket) => {
    socket.onLimit("realm.get", 100, async (cb?: Function) => {
        try {
            const data = await realm_get(socket.user);
            if (socket.processSocketError(data)) return;
            if (cb) cb(data.res);
            else socket.emit("realm.get", data.res);
        } catch (e) {
            socket.logError(e);
        }
    });

    socket.onLimit("dm.get", 100, async (cb?: Function) => {
        try {
            const data = await dm_get(socket.user);
            if (socket.processSocketError(data)) return;
            if (cb) cb(...data.res);
            else socket.emit("dm.get", ...data.res);
        } catch (e) {
            socket.logError(e);
        }
    });

    socket.onLimit("realm.create", 1000, async (name: string, cb?: Function) => {
        try {
            const data = await realm_create(socket.user, name);
            socket.processSocketError(data);
        } catch (e) {
            socket.logError(e);
        }
    });

    socket.onLimit("realm.exit", 1000, async (id: Id) => {
        try {
            const data = await realm_exit(socket.user, id);
            socket.processSocketError(data);
        } catch (e) {
            socket.logError(e);
        }
    });

    socket.onLimit("dm.create", 1000, async (name: string, cb?: Function) => {
        try {
            const data = await dm_create(socket.user, name);
            if(socket.processSocketError(data, cb)) return;
            if (cb) cb(false);
        } catch (e) {
            socket.logError(e);
        }
    });

    socket.onLimit("realm.join", 1000, async (id: Id) => {
        try {
            const data = await realm_join(socket.user, id);
            socket.processSocketError(data);
        } catch (e) {
            socket.logError(e);
        }
    });

    socket.onLimit("realm.mute", 1000, async (id: Id, time: number) => {
        try {
            const data = await realm_mute(socket.user, id, time);
            socket.processSocketError(data);
        } catch (e) {
            socket.logError(e);
        }
    });

    socket.onLimit("dm.block", 1000, async (id: Id, blocked: boolean) => {
        try {
            const data = await dm_block(socket.user, id, blocked);
            socket.processSocketError(data);
        } catch (e) {
            socket.logError(e);
        }
    });
}