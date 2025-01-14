import { Socket_StandardRes_Error } from "../../types/socket/res.js";
import {
    realm_create, 
    realm_exit, 
    realm_get, 
    realm_join, 
    realm_mute, 
    dm_block, 
    dm_create, 
    dm_get,
} from "./logic/chats.js";

export default (socket) => {
    socket.onLimit("realm.get", 100, async (cb) => {
        try{
            const { err, res } = await realm_get(socket.user);
            if(err) return socket.emit(...err as Socket_StandardRes_Error[]);
            if(cb) cb(res);
            else socket.emit("realm.get", res);
        }catch(e){
            socket.logError(e);
        }
    });

    socket.onLimit("dm.get", 100, async (cb) => {
        try{
            const { err, res } = await dm_get(socket.user);
            if(err) return socket.emit(...err as Socket_StandardRes_Error[]);
            if(cb) cb(...res);
            else socket.emit("dm.get", ...res);
        }catch(e){
            socket.logError(e);
        } 
    });

    socket.onLimit("realm.create", 1000, async (name, cb) => {
        try{
            const { err, res } = await realm_create(socket.user, name);
            if(err) return socket.emit(...err as Socket_StandardRes_Error[]);
            if(cb) cb(res);
            else socket.emit("realm.create", res);
        }catch(e){
            socket.logError(e);
        } 
    });

    socket.onLimit("realm.exit", 1000, async (id) => {
        try{
            const { err } = await realm_exit(socket.user, id);
            if(err) return socket.emit(...err as Socket_StandardRes_Error[]);
        }catch(e){
            socket.logError(e);
        }
    });

    socket.onLimit("dm.create", 1000, async (name) => {
        try{
            const { err } = await dm_create(socket.user, name);
            if(err) return socket.emit(...err as Socket_StandardRes_Error[]);
        }catch(e){
            socket.logError(e);
        }
    });

    socket.onLimit("realm.join", 1000, async (id) => {
        try{
            const { err } = await realm_join(socket.user, id);
            if(err) return socket.emit(...err as Socket_StandardRes_Error[]);
        }catch(e){
            socket.logError(e);
        }
    });

    socket.onLimit("realm.mute", 1000, async (id, time) => {
        try{
            if(!socket.user) return socket.emit("error", "not auth");
            const { err } = await realm_mute(socket.user, id, time);
            if(err) return socket.emit(...err as Socket_StandardRes_Error[]);
        }catch(e){
            socket.logError(e);
        }
    });

    socket.onLimit("dm.block", 1000, async (id, blocked) => {
        try{
            const { err } = await dm_block(socket.user, id, blocked);
            if(err) return socket.emit(...err as Socket_StandardRes_Error[]);
        }catch(e){
            socket.logError(e);
        }
    });
}