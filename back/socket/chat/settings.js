import valid from "../../logic/validData.js";

export default (socket) => {
    socket.ontimeout("status.update", 1000, async (status, text) => {
        try{
            if(!socket.user) return socket.emit("error", "not auth");
            if(status && !valid.str(status, 0, 15)) return socket.emit("error.valid", "status.update", "status");
            if(text && !valid.str(text, 0, 150)) return socket.emit("error.valid", "status.update", "text");
            
            if(!status) status = "online";
            if(!text) text = "";

            await global.db.userDatas.updateOneOrAdd(socket.user._id, { _id: "status" }, { status, text });
        }catch(e){
            socket.logError(e);
        }
    });

    socket.ontimeout("status.get", 100, async () => {
        try{
            if(!socket.user) return socket.emit("error", "not auth");

            const status = await global.db.userDatas.findOne(socket.user._id, { _id: "status" });
            if(!status) return socket.emit("status.get", "online", "");
            socket.emit("status.get", status.status, status.text);
        }catch(e){
            socket.logError(e);
        }
    });

    socket.ontimeout("profile.set_nickname", 100, async (nickname) => {
        try{
            if(!socket.user) return socket.emit("error", "not auth");
            if(!valid.str(nickname, 0, 30)) return socket.emit("error.valid", "profile.set_nickname", "nickname");

            await global.db.userDatas.updateOneOrAdd(socket.user._id, (d) => !!d.nick, { nick: nickname }, {}, {}, false);
        }catch(e){
            socket.logError(e);
        }
    });
}