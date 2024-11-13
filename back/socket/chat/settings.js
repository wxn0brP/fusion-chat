import {
    self_status_get,
    self_status_update,
    profile_set_nickname,
} from "./logic/settings.js";

export default (socket) => {
    socket.onLimit("self.status.update", 1000, async (status, text) => {
        try{
            const { err } = await self_status_update(socket.user, status, text);
            if(err) return socket.emit(...err);
        }catch(e){
            socket.logError(e);
        }
    });

    socket.onLimit("self.status.get", 100, async (cb) => {
        try{
            const { err, res } = await self_status_get(socket.user);
            if(err) return socket.emit(...err);
            if(cb) cb(...res);
            else socket.emit("self.status.get", ...res);
        }catch(e){
            socket.logError(e);
        }
    });

    socket.onLimit("profile.set_nickname", 100, async (nickname) => {
        try{
            const { err } = await profile_set_nickname(socket.user, nickname);
            if(err) return socket.emit(...err);
        }catch(e){
            socket.logError(e);
        }
    });
}