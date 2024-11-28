import {
    realm_delete,
    realm_emojis_sync,
    realm_users_sync,
    realm_setup,
    realm_user_kick,
    realm_user_unban,
} from "../chat/logic/realms.js";

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
}