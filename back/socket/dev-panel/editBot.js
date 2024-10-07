import {
    bot_get,
    bot_edit
} from "./logic/edit.js"

export default (socket) => {
    socket.ontimeout("bot.get", 1_000, async (id, cb) => {
        try{
            const { err, res } = await bot_get(socket.user, id);
            if(err) return socket.emit(...err);
            if(cb) cb(res);
            else socket.emit("bot.get", res);
        }catch(e){
            socket.logError(e);
        }
    });
    
    socket.ontimeout("bot.edit", 1_000, async (id, data, cb) => {
        try{
            const { err } = await bot_edit(socket.user, id, data);
            if(err) return socket.emit(...err);
            if(cb) cb();
        }catch(e){
            socket.logError(e);
        }
    });
}
