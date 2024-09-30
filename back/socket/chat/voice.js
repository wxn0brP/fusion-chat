import valid from "../../logic/validData.js";

const roomPrefix = "voice-";

export default (socket) => {
    socket.voiceRoom = null;

    socket.ontimeout("voice.join", 100, async (to) => {
        try{
            if(!socket.user) return socket.emit("error", "not auth");
            if(!valid.str(to, 0, 30)) return socket.emit("error", "valid data");

            emitToRoom(to, "voice.join", socket.user._id);
            emitToRoom(to, "refreshData", "voice.getUsers", to);
            socket.join(roomPrefix + to);
            socket.voiceRoom = to;
        }catch(e){
            socket.logError(e);
        }
    });

    socket.ontimeout("voice.sendData", 50, async (data) => {
        try{
            if(!socket.user) return socket.emit("error", "not auth");
            if(!socket.voiceRoom) return;
            emitToRoom(socket.voiceRoom, "voice.sendData", socket.user._id, data);
        }catch(e){
            socket.logError(e);
        }
    })

    function leaveVoiceChannel(){
        if(!socket.voiceRoom) return;
        const room = socket.voiceRoom;

        socket.leave(roomPrefix + room);
        socket.voiceRoom = null;
        emitToRoom(room, "refreshData", "voice.getUsers");
        emitToRoom(room, "voice.leave", socket.user._id);
    }

    socket.ontimeout("voice.leave", 100, async () => {
        try{
            leaveVoiceChannel();
        }catch(e){
            socket.logError(e);
        }
    });

    socket.on("disconnect", () => {
        try{
            leaveVoiceChannel();
        }catch(e){
            socket.logError(e);
        }
    })

    socket.ontimeout("voice.getUsers", 100, async () => {
        try{
            if(!socket.user) return socket.emit("error", "not auth");
            if(!socket.voiceRoom) return;
            const to = socket.voiceRoom;

            const sockets = io.of("/").adapter.rooms.get(roomPrefix + to);
            const users = [];

            for(const socketId of sockets){
                const socket = io.sockets.sockets.get(socketId);
                if(socket && socket.user) users.push(socket.user._id);
            }

            socket.emit("voice.getUsers", [...new Set(users)]);
        }catch(e){
            socket.logError(e);
        }
    });

    socket.ontimeout("call.private.init", 100, async (id) => {
        try{
            if(!socket.user) return socket.emit("error", "not auth");
            if(!valid.id(id)) return socket.emit("error", "valid data");

            const sockets = global.getSocket(id);
            if(sockets.length == 0) return socket.emit("call.answer", id, false);

            global.sendToSocket(id, "call.private.init", socket.user._id);
        }catch(e){
            socket.logError(e);
        }
    });

    socket.ontimeout("call.private.answer", 100, async (id, answer) => {
        try{
            if(!socket.user) return socket.emit("error", "not auth");
            if(!valid.id(id)) return socket.emit("error", "valid data");
            if(!valid.bool(answer)) return socket.emit("error", "valid data");

            global.sendToSocket(id, "call.private.answer", socket.user._id, answer);
        }catch(e){
            socket.logError(e);
        }
    });
}

function emitToRoom(room, ...args){
    io.of("/").to(roomPrefix + room).emit(...args);
}