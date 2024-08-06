const valid = require("../../logic/validData");
const fs = require("fs");
if(!fs.existsSync("data/calls")) fs.mkdirSync("data/calls");

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
                s.emit("refreshData", "*", "*", "getVoiceChannelUsers", to, false);
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
                
                users.forEach(s => {
                    s.emit("refreshData", "*", "*", "getVoiceChannelUsers", to, false);
                    s.emit("leaveVoiceChannel", socket.user._id);
                })
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

    socket.ontimeout("getVoiceChannelUsers", 100, async (to, make) => {
        try{
            if(!socket.user) return socket.emit("error", "not auth");
            if(!valid.str(to, 0, 30)) return socket.emit("error", "valid data");

            if(!rooms.has(to)) return socket.emit("getVoiceChannelUsers", []);
            const data = rooms.get(to).map(s => s.user._id);

            socket.emit("getVoiceChannelUsers", data, make);
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

    socket.ontimeout("callLogs", 100, async (logs) => {
        try{
            if(!socket.user) return socket.emit("error", "not auth");
            if(!valid.arrayContainsOnlyType(logs, "object")) return socket.emit("error", "valid data");

            const uid = socket.user._id;
            if(!fs.existsSync("data/calls/"+uid)) fs.mkdirSync("data/calls/"+uid);

            const date = new Date().toISOString();
            const path = "data/calls/" + uid + "/" + date + ".json";

            fs.writeFileSync(path, JSON.stringify(logs));
        }catch(e){
            socket.logError(e);
        }
    });
}