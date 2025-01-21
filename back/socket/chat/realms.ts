import { Socket } from "socket.io";
import { Id } from "../../types/base";
import {
    realm_delete,
    realm_emojis_sync,
    realm_users_sync,
    realm_setup,
    realm_user_kick,
    realm_user_unban,
    realm_announcement_channel_subscribe,
    realm_announcement_channel_unsubscribe,
    realm_announcement_channel_available,
    realm_announcement_channel_list,
    realm_thread_create,
    realm_thread_delete,
    realm_thread_list,
    realm_users_activity_sync,
    realm_event_create,
    realm_event_delete,
    realm_event_list,
    realm_event_join,
    realm_event_leave,
    realm_event_get_topic
} from "./logic/realms";
import Socket__Realms from "../../types/socket/chat/realms";

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

    socket.onLimit("realm.announcement.channel.subscribe", 1000, async (sourceRealmId: Id, sourceChannelId: Id, targetRealmId: Id, targetChannelId: Id) => {
        try {
            const data = await realm_announcement_channel_subscribe(socket.user, sourceRealmId, sourceChannelId, targetRealmId, targetChannelId);
            socket.processSocketError(data);
        } catch (e) {
            socket.logError(e);
        }
    });

    socket.onLimit("realm.announcement.channel.unsubscribe", 1000, async (sourceRealmId: Id, sourceChannelId: Id, targetRealmId: Id, targetChannelId: Id) => {
        try {
            const data = await realm_announcement_channel_unsubscribe(socket.user, sourceRealmId, sourceChannelId, targetRealmId, targetChannelId);
            socket.processSocketError(data);
        } catch (e) {
            socket.logError(e);
        }
    });

    socket.onLimit("realm.announcement.channel.available", 5000, async (cb?: Function) => {
        try {
            const data = await realm_announcement_channel_available(socket.user);
            if (socket.processSocketError(data)) return;
            if (cb) cb(data.res);
            else socket.emit("realm.announcement.channel.available", data.res);
        } catch (e) {
            socket.logError(e);
        }
    });

    socket.onLimit("realm.announcement.channel.list", 5000, async (realmId: Id, cb?: Function) => {
        try {
            const data = await realm_announcement_channel_list(socket.user, realmId);
            if (socket.processSocketError(data)) return;
            if (cb) cb(data.res);
            else socket.emit("realm.announcement.channel.list", data.res);
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

    socket.onLimit("realm.event.create", 1000, async (realmId: Id, req: Socket__Realms.Event__req) => {
        try {
            const data = await realm_event_create(socket.user, realmId, req);
            socket.processSocketError(data);
        } catch (e) {
            socket.logError(e);
        }
    });

    socket.onLimit("realm.event.delete", 1000, async (realmId: Id, eventId: Id) => {
        try {
            const data = await realm_event_delete(socket.user, realmId, eventId);
            socket.processSocketError(data);
        } catch (e) {
            socket.logError(e);
        }
    });

    socket.onLimit("realm.event.list", 1000, async (realmId: Id, len: boolean = false, cb?: Function) => {
        try {
            const data = await realm_event_list(socket.user, realmId, len);
            if (socket.processSocketError(data)) return;
            if (cb) cb(data.res);
            else socket.emit("realm.event.list", data.res);
        } catch (e) {
            socket.logError(e);
        }
    });

    socket.onLimit("realm.event.join", 1000, async (realmId: Id, eventId: Id) => {
        try {
            const data = await realm_event_join(socket.user, realmId, eventId);
            socket.processSocketError(data);
        } catch (e) {
            socket.logError(e);
        }
    });

    socket.onLimit("realm.event.leave", 1000, async (realmId: Id, eventId: Id) => {
        try {
            const data = await realm_event_leave(socket.user, realmId, eventId);
            socket.processSocketError(data);
        } catch (e) {
            socket.logError(e);
        }
    });

    socket.onLimit("realm.event.get.topic", 1000, async (realmId: Id, eventId: Id, cb?: Function) => {
        try {
            const data = await realm_event_get_topic(socket.user, realmId, eventId);
            if (socket.processSocketError(data)) return;
            if (cb) cb(data.res);
            else socket.emit("realm.event.get.topic", data.res);
        } catch (e) {
            socket.logError(e);
        }
    });
}