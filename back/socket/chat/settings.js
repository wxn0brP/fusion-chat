module.exports = (socket) => {
    socket.ontimeout("updateStatus", 1000, async (status, text) => {
        try{
            if(!socket.user) return socket.emit("error", "not auth");
            
            if(!status) status = "online";
            if(!text) text = "";

            await global.db.userDatas.updateOneOrAdd(socket.user._id, { _id: "status" }, { status, text });
        }catch(e){
            socket.logError(e);
        }
    });

    socket.ontimeout("getStatus", 100, async () => {
        try{
            if(!socket.user) return socket.emit("error", "not auth");

            const status = await global.db.userDatas.findOne(socket.user._id, { _id: "status" });
            if(!status) return socket.emit("getStatus", "online", "");
            socket.emit("getStatus", status.status, status.text);
        }catch(e){
            socket.logError(e);
        }
    });
}