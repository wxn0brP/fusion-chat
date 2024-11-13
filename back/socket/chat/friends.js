import {
    friend_getAll,
    friend_getRequests,
    friend_remove,
    friend_request,
    friend_response,
    friend_requestRemove,
    user_profile
} from "./logic/friends.js"

export default (socket) => {
    socket.onLimit("friend.request", 1_000, async (nameOrId) => {
        try{
            const { err } = await friend_request(socket.user, nameOrId);
            if(err) return socket.emit(...err);
        }catch(e){
            socket.logError(e);
        }
    });

    socket.onLimit("friend.response", 1_000, async (id, accept) => {
        try{
            const { err } = await friend_response(socket.user, id, accept);
            if(err) return socket.emit(...err);
        }catch(e){
            socket.logError(e);
        }
    });

    socket.onLimit("friend.requestRemove", 1_000, async (id) => {
        try{
            const { err } = await friend_requestRemove(socket.user, id);
            if(err) return socket.emit(...err);
        }catch(e){
            socket.logError(e);
        }
    });

    socket.onLimit("friend.remove", 1_000, async (id) => {
        try{
            const { err } = await friend_remove(socket.user, id);
            if(err) return socket.emit(...err);
        }catch(e){
            socket.logError(e);
        }
    });

    socket.onLimit("friend.getAll", 1_000, async (cb) => {
        try{
            const { err, res } = await friend_getAll(socket.user);
            if(err) return socket.emit(...err);
            if(cb) cb(res);
            else socket.emit("friend.getAll", res);
        }catch(e){
            socket.logError(e);
        }
    });

    socket.onLimit("friend.getRequests", 1_000, async (cb) => {
        try{
            const { err, res } = await friend_getRequests(socket.user);
            if(err) return socket.emit(...err);
            if(cb) cb(res);
            else socket.emit("friend.getRequests", res);
        }catch(e){
            socket.logError(e);
        }
    });

    socket.onLimit("user.profile", 1000, async (id, cb) => {
        try{
            const { err, res } = await user_profile(socket.user, id);
            if(err) return socket.emit(...err);
            if(cb) cb(res);
            else socket.emit("user.profile", res);
        }catch(e){
            socket.logError(e);
        }
    });
}