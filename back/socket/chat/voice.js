const valid = require("../../logic/validData");

const rooms = new Map();

module.exports = (socket) => {
    socket.ontimeout("joinVoiceChannel", 100, async (to) => {
        try{
            if(!socket.user) return socket.emit("error", "not auth");
            if(!valid.str(to, 0, 30)) return socket.emit("error", "valid data");

            if(!rooms.has(to)){
                rooms.set(to, [ socket ]);
                return;
            }

            if(rooms.get(to).filter(s => s.user._id == socket.user._id).length > 0) return socket.emit("error", "already in room");

            rooms.get(to).forEach(s => {
                s.emit("joinVoiceChannel", socket.user._id);
            });
            rooms.get(to).push(socket);
        }catch(e){
            socket.logError(e);
        }
    });

    function leaveVoiceChannel(){
        rooms.forEach((users, to) => {
            users.forEach((user) => {
                if(user.user._id != socket.user._id) return;
                rooms.get(to).splice(rooms.get(to).indexOf(socket), 1);
            });
        });
    }

    socket.ontimeout("leaveVoiceChannel", 100, async () => {
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

    socket.ontimeout("getVoiceChannelUsers", 100, async (to) => {
        try{
            if(!socket.user) return socket.emit("error", "not auth");
            if(!valid.str(to, 0, 30)) return socket.emit("error", "valid data");

            if(!rooms.has(to)) return socket.emit("getVoiceChannelUsers", []);
            const data = rooms.get(to).map(s => s.user._id);
            setTimeout(() => {
                socket.emit("getVoiceChannelUsers", data);
            }, 2_000); // wait for other set up peer
        }catch(e){
            socket.logError(e);
        }
    });

    socket.ontimeout("callToUser", 100, async (id) => {
        try{
            if(!socket.user) return socket.emit("error", "not auth");
            if(!valid.id(id)) return socket.emit("error", "valid data");

            const sockets = global.getSocket(id);
            if(sockets.length == 0) return socket.emit("callToUserAnswer", id, false);

            global.sendToSocket(id, "callToUser", socket.user._id);
        }catch(e){
            socket.logError(e);
        }
    });

    socket.ontimeout("callToUserAnswer", 100, async (id, answer) => {
        try{
            if(!socket.user) return socket.emit("error", "not auth");
            if(!valid.id(id)) return socket.emit("error", "valid data");
            if(!valid.bool(answer)) return socket.emit("error", "valid data");

            global.sendToSocket(id, "callToUserAnswer", socket.user._id, answer);
        }catch(e){
            socket.logError(e);
        }
    });
}