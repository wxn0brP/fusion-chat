import { Socket_StandardRes_Error } from "../../types/socket/res.js";
import {
    bot_get,
    bot_edit,
    bot_generateToken
} from "./logic/edit.js"

export default (socket) => {
    socket.onLimit("bot.get", 1_000, async (id, cb) => {
        try{
            const { err, res } = await bot_get(socket.user, id);
            if(err) return socket.emit(...err as Socket_StandardRes_Error[]);
            if(cb) cb(res);
            else socket.emit("bot.get", res);
        }catch(e){
            socket.logError(e);
        }
    });
    
    socket.onLimit("bot.edit", 1_000, async (id, data, cb) => {
        try{
            const { err } = await bot_edit(socket.user, id, data);
            if(err) return socket.emit(...err as Socket_StandardRes_Error[]);
            if(cb) cb();
        }catch(e){
            socket.logError(e);
        }
    });

    socket.onLimit("bot.generateToken", 1_000, async (id, cb) => {
        try{
            const { err, res } = await bot_generateToken(socket.user, id);
            if(err) return socket.emit(...err as Socket_StandardRes_Error[]);
            if(cb) cb(res);
            else socket.emit("bot.generateToken", res);
        }catch(e){
            socket.logError(e);
        }
    });
}
