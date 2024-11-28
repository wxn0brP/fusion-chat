import {
    voice_getUsers,
    voice_join,
    voice_sendData,
    leaveVoiceChannel,
    call_dm_answer,
    call_dm_init,
} from "./logic/voice.js";

export default (socket) => {
    socket.voiceRoom = null;
    socket.onLimit("voice.join", 100, async (to) => {
        try{
            const { err } = await voice_join(socket, to);
            if(err) return socket.emit(...err);
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
            if(err) return socket.emit(...err);
            if(cb) cb(res);
            else socket.emit("voice.get.users", res);
        }catch(e){
            socket.logError(e);
        }
    });

    socket.onLimit("call.dm.init", 100, async (id, cb) => {
        try{
            const { err, res } = await call_dm_init(socket.user, id);
            if(err) return socket.emit(...err);

            if(!res) return;
            if(cb) cb(id, true);
            else socket.emit("call.dm.init", id, true);
        }catch(e){
            socket.logError(e);
        }
    });

    socket.onLimit("call.dm.answer", 100, async (id, answer) => {
        try{
            const { err } = await call_dm_answer(socket.user, id, answer);
            if(err) return socket.emit(...err);
        }catch(e){
            socket.logError(e);
        }
    });
}