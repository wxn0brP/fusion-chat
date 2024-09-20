const valid = require("../../logic/validData");
const permissionSystem = require("../../logic/permission-system");
const genId = require("../../db/gen");
const emojiMgmt = require("../../logic/emojiMgmt");
const fs = require("fs");

module.exports = (socket) => {
    socket.ontimeout("server.setup", 100, async (id) => {
        try{
            if(!socket.user) return socket.emit("error", "not auth");
            if(!valid.id(id)) return socket.emit("error.valid", "server.setup", "id");

            const serverMeta = await global.db.groupSettings.findOne(id, { _id: "set" });
            if(!serverMeta) return socket.emit("error", "server does not exist");
            
            const name = serverMeta.name;
            const permission = new permissionSystem(id);
            const roles = await permission.getUserRoles(socket.user._id);
            const admin = await permission.userPermison(socket.user._id, "all");

            const buildChannels = [];
            const categories = await global.db.groupSettings.find(id, (r) => !!r.cid);
            const channels = await global.db.groupSettings.find(id, (r) => !!r.chid);
            const sortedCategories = categories.sort((a, b) => a.i - b.i);

            for(let i=0; i<sortedCategories.length; i++){
                const category = sortedCategories[i];
                let chnls = channels.filter(c => c.category == category.cid);
                chnls = chnls.sort((a, b) => a.i - b.i);
                chnls = chnls.map(c => {
                    const visables = [];
                    const texts = [];
                    const alt = c.rp.length == 0 || admin;

                    c.rp.forEach(rp => {
                        const [id, p] = rp.split("/");
                        if(p == "visable") visables.push(id);
                        if(p == "text") texts.push(id);
                    });

                    const visable = alt || visables.some(id => roles.includes(id));
                    if(!visable) return null;

                    const text = alt || texts.some(id => roles.includes(id));
                    return {
                        id: c.chid,
                        name: c.name,
                        type: c.type,
                        text,
                    }
                }).filter(c => !!c);

                if(chnls.length == 0) continue;
                buildChannels.push({
                    id: category.cid,
                    name: category.name,
                    chnls: chnls,
                });
            }

            const isOwnEmoji = fs.existsSync("userFiles/emoji/" + id + ".ttf");

            socket.emit("server.setup", id, name, buildChannels, isOwnEmoji);
        }catch(e){
            socket.logError(e);
        }
    });

    socket.ontimeout("server.roles.sync", 1000, async (id) => {
        try{
            if(!socket.user) return socket.emit("error", "not auth");
            if(!valid.id(id)) return socket.emit("error.valid", "server.roles.sync", "id");
        
            const perm = new permissionSystem(id);
            const roles = await perm.getRoles();
            const rolesData = roles.map(({ name, color }) => { return { name, color }});

            const rolesMap = new Map();
            for(const role of roles) rolesMap.set(role.rid, role.name);

            const users = await global.db.usersPerms.find(id, (r) => !!r.uid);
            const usersData = users.map(u => {
                return {
                    uid: u.uid,
                    roles: u.roles.map(r => rolesMap.get(r)),
                }
            });

            socket.emit("server.roles.sync", usersData, rolesData);
        }catch(e){
            socket.logError(e);
        }
    });

    socket.ontimeout("server.delete", 10_000, async (id, name) => {
        try{
            if(!socket.user) return socket.emit("error", "not auth");
            if(!valid.id(id)) return socket.emit("error.valid", "server.delete", "id");
            if(!valid.str(name, 0, 30)) return socket.emit("error.valid", "server.delete", "name");

            const serverMeta = await global.db.groupSettings.findOne(id, { _id: "set" });
            if(serverMeta.name != name) return socket.emit("error.valid", "server.delete", "name");

            const perm = new permissionSystem(id);
            const userPerm = await perm.userPermison(socket.user._id, "manage server");
            if(!userPerm) return socket.emit("error", "You don't have permission to edit this server");

            const users = (await global.db.usersPerms.find(id, {})).map(u => u.uid);
            for(const user of users) await global.db.userDatas.removeOne(user, { group: id });

            global.db.groupSettings.removeDb(id);
            global.db.usersPerms.removeDb(id);
            global.db.mess.removeDb(id);
            global.db.groupData.removeDb(id);

            for(const user of users) global.sendToSocket(user, "refreshData", "group.get");
        }catch(e){
            socket.logError(e);
        }
    });

    socket.ontimeout("server.user.kick", 1000, async (serverId, uid, ban=false) => {
        try{
            if(!socket.user) return socket.emit("error", "not auth");
            if(!valid.id(serverId)) return socket.emit("error.valid", "server.user.kick", "serverId");
            if(!valid.id(uid)) return socket.emit("error.valid", "server.user.kick", "uid");
            if(!valid.bool(ban)) return socket.emit("error.valid", "server.user.kick", "ban");

            const perm = new permissionSystem(serverId);
            const userPerm = await perm.userPermison(socket.user._id, "manage server");
            if(!userPerm) return socket.emit("error", "You don't have permission to edit this server");

            await global.db.userDatas.removeOne(uid, { group: serverId });
            await global.db.usersPerms.removeOne(serverId, { uid });
            
            if(ban){
                await global.db.usersPerms.add(serverId, { ban: uid }, false);
            }

            global.sendToSocket(uid, "refreshData", "group.get");
        }catch(e){
            socket.logError(e);
        }
    });

    socket.ontimeout("server.user.unban", 1000, async (serverId, uid) => {
        try{
            if(!socket.user) return socket.emit("error", "not auth");
            if(!valid.id(serverId)) return socket.emit("error.valid", "server.user.unban", "serverId");
            if(!valid.id(uid)) return socket.emit("error.valid", "server.user.unban", "uid");

            const perm = new permissionSystem(serverId);
            const userPerm = await perm.userPermison(socket.user._id, "manage server");
            if(!userPerm) return socket.emit("error", "You don't have permission to edit this server");

            await global.db.usersPerms.removeOne(serverId, { ban: uid });
        }catch(e){
            socket.logError(e);
        }
    });

    socket.ontimeout("server.emojis.sync", 1000, async (serverId, cb=()=>{}) => {
        try{
            if(!socket.user) return socket.emit("error", "not auth");
            if(!valid.id(serverId)) return socket.emit("error.valid", "server.emojis.sync", "serverId");

            const emojis = await global.db.groupSettings.find(serverId, (e) => !!e.unicode);
            if(cb){
                cb(emojis);
            }else{
                socket.emit("server.emojis.sync", emojis);
            }
        }catch(e){
            socket.logError(e);
        }
    });
}