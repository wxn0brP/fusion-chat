import {
    group_create, 
    group_exit, 
    group_get, 
    group_join, 
    group_mute, 
    private_block, 
    private_create, 
    private_get,
} from "./logic/chats.js";

export default (socket) => {
    socket.onLimit("group.get", 100, async (cb) => {
        try{
            const { err, res } = await group_get(socket.user);
            if(err) return socket.emit(...err);
            if(cb) cb(res);
            else socket.emit("group.get", res);
        }catch(e){
            socket.logError(e);
        }
    });

    socket.onLimit("private.get", 100, async (cb) => {
        try{
            const { err, res } = await private_get(socket.user);
            if(err) return socket.emit(...err);
            if(cb) cb(res);
            else socket.emit("private.get", res);
        }catch(e){
            socket.logError(e);
        } 
    });

    socket.onLimit("group.create", 1000, async (name, cb) => {
        try{
            const { err, res } = await group_create(socket.user, name);
            if(err) return socket.emit(...err);
            if(cb) cb(res);
            else socket.emit("group.create", res);
        }catch(e){
            socket.logError(e);
        } 
    });

    socket.onLimit("group.exit", 1000, async (id) => {
        try{
            const { err } = await group_exit(socket.user, id);
            if(err) return socket.emit(...err);
        }catch(e){
            socket.logError(e);
        }
    });

    socket.onLimit("private.create", 1000, async (name) => {
        try{
            const { err } = await private_create(socket.user, name);
            if(err) return socket.emit(...err);
        }catch(e){
            socket.logError(e);
        }
    });

    socket.onLimit("group.join", 1000, async (id) => {
        try{
            const { err } = await group_join(socket.user, id);
            if(err) return socket.emit(...err);
        }catch(e){
            socket.logError(e);
        }
    });

    socket.onLimit("group.mute", 1000, async (id, time) => {
        try{
            if(!socket.user) return socket.emit("error", "not auth");
            const { err } = await group_mute(socket.user, id, time);
            if(err) return socket.emit(...err);
        }catch(e){
            socket.logError(e);
        }
    });

    socket.onLimit("private.block", 1000, async (id, blocked) => {
        try{
            const { err } = await private_block(socket.user, id, blocked);
            if(err) return socket.emit(...err);
        }catch(e){
            socket.logError(e);
        }
    });
}