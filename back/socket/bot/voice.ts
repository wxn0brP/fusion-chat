import { Socket_StandardRes_Error } from "../../types/socket/res.js";
import {
    voice_getUsers,
    voice_join,
    voice_sendData,
    leaveVoiceChannel,
} from "../chat/logic/voice.js";

export default (socket) => {
    socket.voiceRoom = null;
    socket.onLimit("voice.join", 100, async (to) => {
        try{
            const { err } = await voice_join(socket, to);
            if(err) return socket.emit(...err as Socket_StandardRes_Error[]);
        }catch(e){
            socket.logError(e);
        }
    });

    socket.onLimit("voice.sendData", 50, async (data) => {
        try{
            voice_sendData(socket.user, socket.voiceRoom, data);
        }catch(e){
            socket.logError(e);
        }
    });

    socket.onLimit("voice.leave", 100, async () => {
        try{
            leaveVoiceChannel(socket);
        }catch(e){
            socket.logError(e);
        }
    });

    socket.on("disconnect", () => {
        try{
            leaveVoiceChannel(socket);
        }catch(e){
            socket.logError(e);
        }
    })

    socket.onLimit("voice.get.users", 100, (cb) => {
        try{
            const { err, res } = voice_getUsers(socket);
            if(err) return socket.emit(...err as Socket_StandardRes_Error[]);
            if(cb) cb(res);
            else socket.emit("voice.get.users", res);
        }catch(e){
            socket.logError(e);
        }
    });
}