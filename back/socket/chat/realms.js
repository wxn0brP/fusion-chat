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
} from "./logic/realms.js";

export default (socket) => {
    socket.onLimit("realm.setup", 100, async (id, cb) => {
        try{
            const { err, res } = await realm_setup(socket.user, id);
            if(err) return socket.emit(...err);
            if(cb) cb(...res);
            else socket.emit("realm.setup", ...res);
        }catch(e){
            socket.logError(e);
        }
    });

    socket.onLimit("realm.users.sync", 1000, async (id, cb) => {
        try{
            const { err, res } = await realm_users_sync(id);
            if(err) return socket.emit(...err);
            if(cb) cb(...res);
            else socket.emit("realm.users.sync", ...res);
        }catch(e){
            socket.logError(e);
        }
    });

    socket.onLimit("realm.delete", 10_000, async (id, name) => {
        try{
            const { err } = await realm_delete(socket.user, id, name);
            if(err) return socket.emit(...err);
        }catch(e){
            socket.logError(e);
        }
    });

    socket.onLimit("realm.user.kick", 1000, async (realmId, uid, ban=false) => {
        try{
            const { err } = await realm_user_kick(socket.user, realmId, uid, ban);
            if(err) return socket.emit(...err);
        }catch(e){
            socket.logError(e);
        }
    });

    socket.onLimit("realm.user.unban", 1000, async (realmId, uid) => {
        try{
            const { err } = await realm_user_unban(socket.user, realmId, uid);
            if(err) return socket.emit(...err);
        }catch(e){
            socket.logError(e);
        }
    });

    socket.onLimit("realm.emojis.sync", 1000, async (realmId, cb) => {
        try{
            const { err, res } = await realm_emojis_sync(realmId);
            if(err) return socket.emit(...err);
            if(cb) cb(res);
            else socket.emit("realm.emojis.sync", res);
        }catch(e){
            socket.logError(e);
        }
    });

    socket.onLimit("realm.event.channel.subscribe", 1000, async (sourceRealmId, sourceChannelId, targetRealmId, targetChannelId) => {
        try{
            const { err } = await realm_event_channel_subscribe(socket.user, sourceRealmId, sourceChannelId, targetRealmId, targetChannelId);
            if(err) return socket.emit(...err);
        }catch(e){
            socket.logError(e);
        }
    });

    socket.onLimit("realm.event.channel.unsubscribe", 1000, async (sourceRealmId, sourceChannelId, targetRealmId, targetChannelId) => {
        try{
            const { err } = await realm_event_channel_unsubscribe(socket.user, sourceRealmId, sourceChannelId, targetRealmId, targetChannelId);
            if(err) return socket.emit(...err);
        }catch(e){
            socket.logError(e);
        }
    });

    socket.onLimit("realm.event.channel.available", 5000, async (cb) => {
        try{
            const { err, res } = await realm_event_channel_available(socket.user);
            if(err) return socket.emit(...err);
            if(cb) cb(res);
            else socket.emit("realm.event.channel.available", res);
        }catch(e){
            socket.logError(e);
        }
    });

    socket.onLimit("realm.event.channel.list", 5000, async (realmId, cb) => {
        try{
            const { err, res } = await realm_event_channel_list(socket.user, realmId);
            if(err) return socket.emit(...err);
            if(cb) cb(res);
            else socket.emit("realm.event.channel.list", res);
        }catch(e){
            socket.logError(e);
        }
    });

    socket.onLimit("realm.thread.create", 1000, async (realmId, channelId, name, replyMsgId=null, cb) => {
        try{
            const { err, res } = await realm_thread_create(socket.user, realmId, channelId, name, replyMsgId);
            if(err) return socket.emit(...err);
            if(cb) cb(res);
            else socket.emit("realm.thread.create", res);
        }catch(e){
            socket.logError(e);
        }
    });

    socket.onLimit("realm.thread.delete", 1000, async (realmId, channelId, threadId) => {
        try{
            const { err } = await realm_thread_delete(socket.user, realmId, channelId, threadId);
            if(err) return socket.emit(...err);
        }catch(e){
            socket.logError(e);
        }
    });

    socket.onLimit("realm.thread.list", 1000, async (realmId, channelId, cb) => {
        try{
            const { err, res } = await realm_thread_list(socket.user, realmId, channelId);
            if(err) return socket.emit(...err);
            if(cb) cb(res);
            else socket.emit("realm.thread.list", res);
        }catch(e){
            socket.logError(e);
        }
    });
}