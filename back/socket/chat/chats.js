const chatMgmt = require("../../logic/chatMgmt");
const valid = require("../../logic/validData");

module.exports = (socket) => {
    socket.ontimeout("group.get", 100, async () => {
        try{
            const groups = await global.db.userDatas.find(socket.user._id, r => !!r.group);
            if(groups.length == 0) return socket.emit("group.get", []);

            for(let i = 0; i < groups.length; i++){
                const group = groups[i];
                const serverSet = await global.db.groupSettings.findOne(group.group, { _id: 'set' });
                group.img = serverSet.img || false;
            }

            socket.emit("group.get", groups);
        }catch(e){
            socket.logError(e);
        } 
    });

    socket.ontimeout("private.get", 100, async () => {
        try{
            const privs = await global.db.userDatas.find(socket.user._id, r => !!r.priv);
            if(privs.length == 0) return socket.emit("private.get", []);

            for(let i = 0; i < privs.length; i++){
                const priv = privs[i];
                const id = chatMgmt.combinateId(socket.user._id, priv.priv);
                const lastMess = await global.db.mess.find(id, {}, { reverse: true, max: 1 });
                if(lastMess.length == 0) continue;

                privs.find(p => p.priv == priv.priv).lastMessId = lastMess[0]._id;
            }

            socket.emit("private.get", privs);
        }catch(e){
            socket.logError(e);
        } 
    });

    socket.ontimeout("group.create", 1000, async (name) => {
        try{
            if(!socket.user) return socket.emit("error", "not auth");
            if(!valid.str(name, 0, 30)) return socket.emit("error", "valid data");

            await chatMgmt.createChat(name, socket.user._id);
        }catch(e){
            socket.logError(e);
        } 
    });

    socket.ontimeout("group.exit", 1000, async (id) => {
        try{
            if(!socket.user) return socket.emit("error", "not auth");
            if(!valid.id(id)) return socket.emit("error", "valid data");

            await chatMgmt.exitChat(id, socket.user._id);
            global.sendToSocket(socket.user._id, "refreshData", "group.get");
        }catch(e){
            socket.logError(e);
        }
    });

    socket.ontimeout("private.create", 1000, async (name) => {
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

            global.sendToSocket(socket.user._id, "refreshData", "private.get");
            global.sendToSocket(toId, "refreshData", "private.get");
        }catch(e){
            socket.logError(e);
        }
    });

    socket.ontimeout("group.join", 1000, async (id) => {
        try{
            if(!socket.user) return socket.emit("error", "not auth");
            if(!valid.id(id)) return socket.emit("error", "valid data");

            const exists = await global.db.userDatas.findOne(socket.user._id, { group: id });
            if(exists) return socket.emit("error", "already in group");

            const isBaned = await global.db.usersPerms.findOne(id, { ban: socket.user._id });
            if(isBaned) return socket.emit("error", "user is baned");
            
            await chatMgmt.addUserToChat(id, socket.user._id);
            global.sendToSocket(socket.user._id, "refreshData", "group.get");
        }catch(e){
            socket.logError(e);
        }
    });
}