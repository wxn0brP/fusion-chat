import {
    status_get,
    status_update,
    profile_set_nickname,
} from "./logic/settings.js";

export default (socket) => {
    socket.ontimeout("status.update", 1000, async (status, text) => {
        try{
            const { err } = await status_update(socket.user, status, text);
            if(err) return socket.emit(...err);
        }catch(e){
            socket.logError(e);
        }
    });

    socket.ontimeout("status.get", 100, async (cb) => {
        try{
            const { err, res } = await status_get(socket.user);
            if(err) return socket.emit(...err);
            if(cb) cb(...res);
            else socket.emit("status.get", ...res);
        }catch(e){
            socket.logError(e);
        }
    });

    socket.ontimeout("profile.set_nickname", 100, async (nickname) => {
        try{
            const { err } = await profile_set_nickname(socket.user, nickname);
            if(err) return socket.emit(...err);
        }catch(e){
            socket.logError(e);
        }
    });
}