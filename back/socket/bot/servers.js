import {
    server_delete,
    server_emojis_sync,
    server_roles_sync,
    server_setup,
    server_user_kick,
    server_user_unban,
} from "../chat/logic/servers.js";

export default (socket) => {
    socket.onLimit("server.setup", 100, async (id, cb) => {
        try{
            const { err, res } = await server_setup(socket.user, id);
            if(err) return socket.emit(...err);
            if(cb) cb(...res);
            else socket.emit("server.setup", ...res);
        }catch(e){
            socket.logError(e);
        }
    });

    socket.onLimit("server.roles.sync", 1000, async (id, cb) => {
        try{
            const { err, res } = await server_roles_sync(id);
            if(err) return socket.emit(...err);
            if(cb) cb(...res);
            else socket.emit("server.roles.sync", ...res);
        }catch(e){
            socket.logError(e);
        }
    });

    socket.onLimit("server.delete", 10_000, async (id, name) => {
        try{
            const { err } = await server_delete(socket.user, id, name);
            if(err) return socket.emit(...err);
        }catch(e){
            socket.logError(e);
        }
    });

    socket.onLimit("server.user.kick", 1000, async (serverId, uid, ban=false) => {
        try{
            const { err } = await server_user_kick(socket.user, serverId, uid, ban);
            if(err) return socket.emit(...err);
        }catch(e){
            socket.logError(e);
        }
    });

    socket.onLimit("server.user.unban", 1000, async (serverId, uid) => {
        try{
            const { err } = await server_user_unban(socket.user, serverId, uid);
            if(err) return socket.emit(...err);
        }catch(e){
            socket.logError(e);
        }
    });

    socket.onLimit("server.emojis.sync", 1000, async (serverId, cb) => {
        try{
            const { err, res } = await server_emojis_sync(serverId);
            if(err) return socket.emit(...err);
            if(cb) cb(res);
            else socket.emit("server.emojis.sync", res);
        }catch(e){
            socket.logError(e);
        }
    });
}