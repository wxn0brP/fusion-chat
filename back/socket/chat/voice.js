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

    socket.ontimeout("leaveVoiceChannel", 100, async (to) => {
        try{
            if(!socket.user) return socket.emit("error", "not auth");
            if(!valid.str(to, 0, 30)) return socket.emit("error", "valid data");

            if(!rooms.has(to)) return;
            rooms.get(to).splice(rooms.get(to).indexOf(socket), 1);
            if(rooms.get(to).length == 0) rooms.delete(to);
        }catch(e){
            socket.logError(e);
        }
    });

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

    socket.on("disconnect", () => {
        if(!socket.user) return;
        rooms.forEach((users, to) => {
            users.forEach((user) => {
                if(user.user._id != socket.user._id) return;
                rooms.get(to).splice(rooms.get(to).indexOf(socket), 1);
            });
        });
    })
}