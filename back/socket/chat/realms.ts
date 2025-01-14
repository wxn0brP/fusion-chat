import { Socket } from "socket.io";
import { Id } from "../../types/base.js";
import {
    realm_delete,
    realm_emojis_sync,
    realm_users_sync,
    realm_setup,
    realm_user_kick,
    realm_user_unban,
    realm_event_channel_subscribe,
    realm_event_channel_unsubscribe,
    realm_event_channel_available,
    realm_event_channel_list,
    realm_thread_create,
    realm_thread_delete,
    realm_thread_list,
    realm_users_activity_sync,
} from "./logic/realms.js";

export default (socket: Socket) => {
    socket.onLimit("realm.setup", 100, async (id: Id, cb?: Function) => {
        try {
            const data = await realm_setup(socket.user, id);
            if (socket.processSocketError(data)) return;
            if (cb) cb(...data.res);
            else socket.emit("realm.setup", ...data.res);
        } catch (e) {
            socket.logError(e);
        }
    });

    socket.onLimit("realm.users.sync", 1000, async (id: Id, cb?: Function) => {
        try {
            const data = await realm_users_sync(id);
            if (socket.processSocketError(data)) return;
            if (cb) cb(...data.res);
            else socket.emit("realm.users.sync", ...data.res);
        } catch (e) {
            socket.logError(e);
        }
    });

    socket.onLimit("realm.users.activity.sync", 1000, async (id: Id, cb?: Function) => {
        try {
            const data = await realm_users_activity_sync(id);
            if (socket.processSocketError(data)) return;
            if (cb) cb(...data.res);
            else socket.emit("realm.users.activity.sync", ...data.res);
        } catch (e) {
            socket.logError(e);
        }
    })

    socket.onLimit("realm.delete", 10_000, async (id: Id, name: string) => {
        try {
            const data = await realm_delete(socket.user, id, name);
            socket.processSocketError(data);
        } catch (e) {
            socket.logError(e);
        }
    });

    socket.onLimit("realm.user.kick", 1000, async (realmId: Id, uid: Id, ban: boolean = false) => {
        try {
            const data = await realm_user_kick(socket.user, realmId, uid, ban);
            socket.processSocketError(data);
        } catch (e) {
            socket.logError(e);
        }
    });

    socket.onLimit("realm.user.unban", 1000, async (realmId: Id, uid: Id) => {
        try {
            const data = await realm_user_unban(socket.user, realmId, uid);
            socket.processSocketError(data);
        } catch (e) {
            socket.logError(e);
        }
    });

    socket.onLimit("realm.emojis.sync", 1000, async (realmId: Id, cb?: Function) => {
        try {
            const data = await realm_emojis_sync(realmId);
            if (socket.processSocketError(data)) return;
            if (cb) cb(data.res);
            else socket.emit("realm.emojis.sync", data.res);
        } catch (e) {
            socket.logError(e);
        }
    });

    socket.onLimit("realm.event.channel.subscribe", 1000, async (sourceRealmId: Id, sourceChannelId: Id, targetRealmId: Id, targetChannelId: Id) => {
        try {
            const data = await realm_event_channel_subscribe(socket.user, sourceRealmId, sourceChannelId, targetRealmId, targetChannelId);
            socket.processSocketError(data);
        } catch (e) {
            socket.logError(e);
        }
    });

    socket.onLimit("realm.event.channel.unsubscribe", 1000, async (sourceRealmId: Id, sourceChannelId: Id, targetRealmId: Id, targetChannelId: Id) => {
        try {
            const data = await realm_event_channel_unsubscribe(socket.user, sourceRealmId, sourceChannelId, targetRealmId, targetChannelId);
            socket.processSocketError(data);
        } catch (e) {
            socket.logError(e);
        }
    });

    socket.onLimit("realm.event.channel.available", 5000, async (cb?: Function) => {
        try {
            const data = await realm_event_channel_available(socket.user);
            if (socket.processSocketError(data)) return;
            if (cb) cb(data.res);
            else socket.emit("realm.event.channel.available", data.res);
        } catch (e) {
            socket.logError(e);
        }
    });

    socket.onLimit("realm.event.channel.list", 5000, async (realmId: Id, cb?: Function) => {
        try {
            const data = await realm_event_channel_list(socket.user, realmId);
            if (socket.processSocketError(data)) return;
            if (cb) cb(data.res);
            else socket.emit("realm.event.channel.list", data.res);
        } catch (e) {
            socket.logError(e);
        }
    });

    socket.onLimit("realm.thread.create", 1000, async (realmId: Id, channelId: Id, name: string, replyMsgId: Id = null, cb?: Function) => {
        try {
            const data = await realm_thread_create(socket.user, realmId, channelId, name, replyMsgId);
            if (socket.processSocketError(data)) return;
            if (cb) cb(data.res);
            else socket.emit("realm.thread.create", data.res);
        } catch (e) {
            socket.logError(e);
        }
    });

    socket.onLimit("realm.thread.delete", 1000, async (realmId: Id, threadId: Id) => {
        try {
            const data = await realm_thread_delete(socket.user, realmId, threadId);
            socket.processSocketError(data);
        } catch (e) {
            socket.logError(e);
        }
    });

    socket.onLimit("realm.thread.list", 1000, async (realmId: Id, channelId: Id, cb?: Function) => {
        try {
            const data = await realm_thread_list(socket.user, realmId, channelId);
            if (socket.processSocketError(data)) return;
            if (cb) cb(data.res);
            else socket.emit("realm.thread.list", data.res);
        } catch (e) {
            socket.logError(e);
        }
    });
}