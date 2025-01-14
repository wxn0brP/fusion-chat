import { Id } from "../../types/base.js";
import { Socket_StandardRes_Error } from "../../types/socket/res.js";
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

export default (socket) => {
    socket.onLimit("realm.setup", 100, async (id: Id, cb?: Function) => {
        try {
            const { err, res } = await realm_setup(socket.user, id);
            if (err) return socket.emit(...err as Socket_StandardRes_Error[]);
            if (cb) cb(...res);
            else socket.emit("realm.setup", ...res);
        } catch (e) {
            socket.logError(e);
        }
    });

    socket.onLimit("realm.users.sync", 1000, async (id: Id, cb?: Function) => {
        try {
            const { err, res } = await realm_users_sync(id);
            if (err) return socket.emit(...err as Socket_StandardRes_Error[]);
            if (cb) cb(...res);
            else socket.emit("realm.users.sync", ...res);
        } catch (e) {
            socket.logError(e);
        }
    });

    socket.onLimit("realm.users.activity.sync", 1000, async (id: Id, cb?: Function) => {
        try {
            const { err, res } = await realm_users_activity_sync(id);
            if (err) return socket.emit(...err as Socket_StandardRes_Error[]);
            if (cb) cb(...res);
            else socket.emit("realm.users.activity.sync", ...res);
        } catch (e) {
            socket.logError(e);
        }
    })

    socket.onLimit("realm.delete", 10_000, async (id: Id, name: string) => {
        try {
            const { err } = await realm_delete(socket.user, id, name);
            if (err) return socket.emit(...err as Socket_StandardRes_Error[]);
        } catch (e) {
            socket.logError(e);
        }
    });

    socket.onLimit("realm.user.kick", 1000, async (realmId: Id, uid: Id, ban: boolean = false) => {
        try {
            const { err } = await realm_user_kick(socket.user, realmId, uid, ban);
            if (err) return socket.emit(...err as Socket_StandardRes_Error[]);
        } catch (e) {
            socket.logError(e);
        }
    });

    socket.onLimit("realm.user.unban", 1000, async (realmId: Id, uid: Id) => {
        try {
            const { err } = await realm_user_unban(socket.user, realmId, uid);
            if (err) return socket.emit(...err as Socket_StandardRes_Error[]);
        } catch (e) {
            socket.logError(e);
        }
    });

    socket.onLimit("realm.emojis.sync", 1000, async (realmId: Id, cb?: Function) => {
        try {
            const { err, res } = await realm_emojis_sync(realmId);
            if (err) return socket.emit(...err as Socket_StandardRes_Error[]);
            if (cb) cb(res);
            else socket.emit("realm.emojis.sync", res);
        } catch (e) {
            socket.logError(e);
        }
    });

    socket.onLimit("realm.event.channel.subscribe", 1000, async (sourceRealmId: Id, sourceChannelId: Id, targetRealmId: Id, targetChannelId: Id) => {
        try {
            const { err } = await realm_event_channel_subscribe(socket.user, sourceRealmId, sourceChannelId, targetRealmId, targetChannelId);
            if (err) return socket.emit(...err as Socket_StandardRes_Error[]);
        } catch (e) {
            socket.logError(e);
        }
    });

    socket.onLimit("realm.event.channel.unsubscribe", 1000, async (sourceRealmId: Id, sourceChannelId: Id, targetRealmId: Id, targetChannelId: Id) => {
        try {
            const { err } = await realm_event_channel_unsubscribe(socket.user, sourceRealmId, sourceChannelId, targetRealmId, targetChannelId);
            if (err) return socket.emit(...err as Socket_StandardRes_Error[]);
        } catch (e) {
            socket.logError(e);
        }
    });

    socket.onLimit("realm.event.channel.available", 5000, async (cb?: Function) => {
        try {
            const { err, res } = await realm_event_channel_available(socket.user);
            if (err) return socket.emit(...err as Socket_StandardRes_Error[]);
            if (cb) cb(res);
            else socket.emit("realm.event.channel.available", res);
        } catch (e) {
            socket.logError(e);
        }
    });

    socket.onLimit("realm.event.channel.list", 5000, async (realmId: Id, cb?: Function) => {
        try {
            const { err, res } = await realm_event_channel_list(socket.user, realmId);
            if (err) return socket.emit(...err as Socket_StandardRes_Error[]);
            if (cb) cb(res);
            else socket.emit("realm.event.channel.list", res);
        } catch (e) {
            socket.logError(e);
        }
    });

    socket.onLimit("realm.thread.create", 1000, async (realmId: Id, channelId: Id, name: string, replyMsgId: Id = null, cb?: Function) => {
        try {
            const { err, res } = await realm_thread_create(socket.user, realmId, channelId, name, replyMsgId);
            if (err) return socket.emit(...err as Socket_StandardRes_Error[]);
            if (cb) cb(res);
            else socket.emit("realm.thread.create", res);
        } catch (e) {
            socket.logError(e);
        }
    });

    socket.onLimit("realm.thread.delete", 1000, async (realmId: Id, threadId: Id) => {
        try {
            const { err } = await realm_thread_delete(socket.user, realmId, threadId);
            if (err) return socket.emit(...err as Socket_StandardRes_Error[]);
        } catch (e) {
            socket.logError(e);
        }
    });

    socket.onLimit("realm.thread.list", 1000, async (realmId: Id, channelId: Id, cb?: Function) => {
        try {
            const { err, res } = await realm_thread_list(socket.user, realmId, channelId);
            if (err) return socket.emit(...err as Socket_StandardRes_Error[]);
            if (cb) cb(res);
            else socket.emit("realm.thread.list", res);
        } catch (e) {
            socket.logError(e);
        }
    });
}