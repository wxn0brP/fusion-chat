import {
    voice_getUsers,
    voice_join,
    voice_sendData,
    leaveVoiceChannel,
    call_private_answer,
    call_private_init,
} from "./logic/voice.js";

export default (socket) => {
    socket.voiceRoom = null;
    socket.ontimeout("voice.join", 100, async (to) => {
        try{
            const { err } = await voice_join(socket, to);
            if(err) return socket.emit(...err);
        }catch(e){
            socket.logError(e);
        }
    });

    socket.ontimeout("voice.sendData", 50, async (data) => {
        try{
            const { err } = await voice_sendData(socket.user, socket.voiceRoom, data);
            if(err) return socket.emit(...err);
        }catch(e){
            socket.logError(e);
        }
    });

    socket.ontimeout("voice.leave", 100, async () => {
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

    socket.ontimeout("voice.getUsers", 100, (cb) => {
        try{
            const { err, res } = voice_getUsers(socket.user);
            if(err) return socket.emit(...err);
            if(cb) cb(res);
            else socket.emit("voice.getUsers", res);
        }catch(e){
            socket.logError(e);
        }
    });

    socket.ontimeout("call.private.init", 100, async (id, cb) => {
        try{
            const { err, res } = await call_private_init(socket.user, id);
            if(err) return socket.emit(...err);

            if(!res) return;
            if(cb) cb(id, false);
            else socket.emit("call.private.init", id, false);
        }catch(e){
            socket.logError(e);
        }
    });

    socket.ontimeout("call.private.answer", 100, async (id, answer) => {
        try{
            const { err } = await call_private_answer(socket.user, id, answer);
            if(err) return socket.emit(...err);
        }catch(e){
            socket.logError(e);
        }
    });
}