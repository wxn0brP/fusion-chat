import {
    bots_get,
    bots_create,
    bots_delete
} from "./logic/mgmt.js";

export default (socket) => {
    socket.ontimeout("bots.get", 1_000, async (cb) => {
        try{
            if(typeof cb !== "function") return socket.emit("error.valid", "bots.get", "cb");
            const bots = await bots_get(socket.user);
            if(cb) cb(bots);
            else socket.emit("bots.get", bots);
        }catch(e){
            socket.logError(e);
        }
    });

    socket.ontimeout("bot.delete", 1_000, async (id, cb) => {
        try{
            const { err } = await bots_delete(socket.user, id);
            if(err) return socket.emit(...err);
            if(cb) cb();
        }catch(e){
            socket.logError(e);
        }
    });

    socket.ontimeout("bot.create", 1_000, async (name, cb) => {
        try{
            const { err, res } = await bots_create(socket.user, name);
            if(err) return socket.emit(...err);
            if(cb) cb(res);
        }catch(e){
            socket.logError(e);
        }
    });
}