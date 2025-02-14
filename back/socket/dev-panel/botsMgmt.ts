import { Socket_StandardRes_Error } from "../../types/socket/res";
import {
    bots_get,
    bots_create,
    bots_delete
} from "./logic/mgmt";

export default (socket) => {
    socket.onLimit("bots.get", 1_000, async (cb) => {
        try{
            if(typeof cb !== "function") return socket.emit("error.valid", "bots.get", "cb");
            const bots = await bots_get(socket.user);
            if(cb) cb(bots);
            else socket.emit("bots.get", bots);
        }catch(e){
            socket.logError(e);
        }
    });

    socket.onLimit("bot.delete", 1_000, async (id, cb) => {
        try{
            const { err } = await bots_delete(socket.user, id);
            if(err) return socket.emit(...err as Socket_StandardRes_Error[]);
            if(cb) cb();
        }catch(e){
            socket.logError(e);
        }
    });

    socket.onLimit("bot.create", 1_000, async (name, cb) => {
        try{
            const { err, res } = await bots_create(socket.user, name);
            if(err) return socket.emit(...err as Socket_StandardRes_Error[]);
            if(cb) cb(res);
        }catch(e){
            socket.logError(e);
        }
    });
}