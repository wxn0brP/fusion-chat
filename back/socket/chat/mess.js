import sendMessage from "../../logic/sendMessage.js";
import {
    message_delete,
    message_edit,
    message_fetch,
    message_fetch_pinned,
    message_markAsRead,
    message_pin,
    message_react,
    message_search,
    message_fetch_id,
} from "./logic/mess.js";

export default (socket) => {
    socket.ontimeout("mess", 200, async (req) => {
        try{
            const { err } = await sendMessage(req, socket.user);
            if(err) return socket.emit(...err);
        }catch(e){
            socket.logError(e);
        }
    });

    socket.ontimeout("message.edit", 1000, async (toM, _id, msg) => {
        try{
            const { err } = await message_edit(socket.user, toM, _id, msg);
            if(err) return socket.emit(...err);
        }catch(e){
            socket.logError(e);
        }
    });
    
    socket.ontimeout("message.delete", 1000, async (toM, _id) => {
        try{
            const { err } = await message_delete(socket.user, toM, _id);
            if(err) return socket.emit(...err);
        }catch(e){
            socket.logError(e);
        }
    });

    socket.ontimeout("message.fetch", 300, async (to, chnl, start, end, cb) => {
        try{
            const { err, res } = await message_fetch(socket.user, to, chnl, start, end);
            if(err) return socket.emit(...err);
            if(cb) cb(res);
            else socket.emit("message.fetch", res);
        }catch(e){
            socket.logError(e);
        }
    });

    socket.ontimeout("message.fetch.id", 300, async (to, chnl, _id, cb) => {
        try{
            const { err, res } = await message_fetch_id(socket.user, to, chnl, _id);
            if(err) return socket.emit(...err);
            if(cb) cb(res);
            else socket.emit("message.fetch.id", res);
        }catch(e){
            socket.logError(e);
        }
    });

    socket.ontimeout("message.markAsRead", 100, async (to, chnl, mess_id, cb) => {
        try{
            const { err, res } = await message_markAsRead(socket.user, to, chnl, mess_id);
            if(err) return socket.emit(...err);
            if(!res) return;
            if(cb) cb(res);
            else socket.emit("message.markAsRead", res);
        }catch(e){
            socket.logError(e);
        }
    });

    socket.ontimeout("message.react", 100, async (server, msgId, react) => {
        try{
            const { err } = await message_react(socket.user, server, msgId, react);
            if(err) return socket.emit(...err);
        }catch(e){
            socket.logError(e);
        }
    });

    socket.ontimeout("message.search", 1000, async (server, chnl, query, cb) => {
        try{
            const { err, res } = await message_search(socket.user, server, chnl, query);
            if(err) return socket.emit(...err);
            if(cb) cb(res);
            else socket.emit("message.search", res);
        }catch(e){
            socket.logError(e);
        }
    });

    socket.ontimeout("message.pin", 1000, async (server, chnl, msgId, pin) => {
       try{
           const { err } = await message_pin(socket.user, server, chnl, msgId, pin);
           if(err) return socket.emit(...err);
       }catch(e){
           socket.logError(e);
       }
    });

    socket.ontimeout("message.fetch.pinned", 1000, async (server, chnl, cb) => {
        try{
            const { err, res } = await message_fetch_pinned(socket.user, server, chnl);
            if(err) return socket.emit(...err);
            if(cb) cb(res);
            else socket.emit("message.fetch.pinned", res);
        }catch(e){
            socket.logError(e);
        }
    });
}