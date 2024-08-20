const chatMgmt = require("../../logic/chatMgmt");
const valid = require("../../logic/validData");

module.exports = (socket) => {
    socket.ontimeout("getGroups", 100, async () => {
        try{
            const groups = await global.db.userDatas.find(socket.user._id, r => !!r.group);
            socket.emit("getGroups", groups || []);
        }catch(e){
            socket.logError(e);
        } 
    });

    socket.ontimeout("getPrivs", 100, async () => {
        try{
            const privs = await global.db.userDatas.find(socket.user._id, r => !!r.priv);
            if(privs.length == 0) return socket.emit("getPrivs", []);

            for(let i = 0; i < privs.length; i++){
                const priv = privs[i];
                const id = chatMgmt.combinateId(socket.user._id, priv.priv);
                const lastMess = await global.db.mess.find(id, {}, { reverse: true, max: 1 });
                if(lastMess.length == 0) continue;

                privs.find(p => p.priv == priv.priv).lastMessId = lastMess[0]._id;
            }

            socket.emit("getPrivs", privs);
        }catch(e){
            socket.logError(e);
        } 
    });

    socket.ontimeout("createGroup", 1000, async (name) => {
        try{
            if(!socket.user) return socket.emit("error", "not auth");
            if(!valid.str(name, 0, 30)) return socket.emit("error", "valid data");

            await chatMgmt.createChat(name, socket.user._id);
        }catch(e){
            socket.logError(e);
        } 
    });

    socket.ontimeout("exitGroup", 1000, async (id) => {
        try{
            if(!socket.user) return socket.emit("error", "not auth");
            if(!valid.id(id)) return socket.emit("error", "valid data");

            await chatMgmt.exitChat(id, socket.user._id);
        }catch(e){
            socket.logError(e);
        }
    });

    socket.ontimeout("createPriv", 1000, async (name) => {
        try{
            if(!socket.user) return socket.emit("error", "not auth");
            if(!valid.str(name, 0, 30)) return socket.emit("error", "valid data");

            const user = await global.db.data.findOne("user", { name });
            if(!user) return socket.emit("error", "user not found");

            const toId = user._id;

            const priv = await global.db.userDatas.findOne(socket.user._id, (r) => {
                if(!r.priv) return false;
                if(r.priv == toId) return true;
            });
            if(priv) return socket.emit("error", "already priv");

            await chatMgmt.createPriv(toId, socket.user._id);

            global.sendToSocket(socket.user._id, "refreshData", "getPrivs");
            global.sendToSocket(toId, "refreshData", "getPrivs");
        }catch(e){
            socket.logError(e);
        }
    });

    socket.ontimeout("joinGroup", 1000, async (id) => {
        try{
            if(!socket.user) return socket.emit("error", "not auth");
            if(!valid.id(id)) return socket.emit("error", "valid data");

            const exists = await global.db.userDatas.findOne(socket.user._id, { group: id });
            if(exists) return socket.emit("error", "already in group");
            
            await chatMgmt.addUserToChat(id, socket.user._id);
        }catch(e){
            socket.logError(e);
        }
    });
}