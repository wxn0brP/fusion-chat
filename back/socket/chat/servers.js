const valid = require("../../logic/validData");
const permissionSystem = require("../../logic/permission-system");
const genId = require("../../db/gen");
const processDbChanges = require("../../logic/processDbChanges");
const emojiMgmt = require("../../logic/emojiMgmt");
const fs = require("fs");

const validShema = {
    setServerSettings: valid.objAjv(require("./valid/setServerSettings")),
}

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

            socket.emit("server.setup", id, name, buildChannels);
        }catch(e){
            socket.logError(e);
        }
    });

    socket.ontimeout("server.settings.get", 5_000, async (id) => {
        try{
            if(!socket.user) return socket.emit("error", "not auth");
            if(!valid.id(id)) return socket.emit("error.valid", "server.settings.get", "id");

            const perm = new permissionSystem(id);
            const userPerm = await perm.userPermison(socket.user._id, "manage server");
            if(!userPerm) return socket.emit("error", "You don't have permission to edit this server");

            const meta = await global.db.groupSettings.findOne(id, { _id: "set" });
            delete meta._id;
            const categories = await global.db.groupSettings.find(id, (r) => !!r.cid);
            const channels = await global.db.groupSettings.find(id, (r) => !!r.chid);
            const roles = await perm.getRoles();
            const users = await global.db.usersPerms.find(id, (u) => !!u.uid);
            const banUsers = await global.db.usersPerms.find(id, (u) => !!u.ban);
            const emojis = await global.db.groupSettings.find(id, (e) => !!e.unicode);

            const data = {
                meta,
                categories,
                channels,
                roles,
                users: users.map(u => { return { uid: u.uid, roles: u.roles }}),
                banUsers: banUsers.map(u => u.ban),
                emojis,
            };

            socket.emit("server.settings.get", data, id);
        }catch(e){
            socket.logError(e);
        }
    });

    socket.ontimeout("server.settings.set", 5_000, async (id, data) => {
        try{
            if(!socket.user) return socket.emit("error", "not auth");
            if(!valid.id(id)) return socket.emit("error.valid", "server.settings.set", "id");

            const perm = new permissionSystem(id);
            const userPerm = await perm.userPermison(socket.user._id, "manage server");
            if(!userPerm) return socket.emit("error", "You don't have permission to edit this server");

            if(!validShema.setServerSettings(data)){
                lo(validShema.setServerSettings.errors);
                return socket.emit("error.valid", "server.settings.set", "data", validShema.setServerSettings.errors);
            }

            const o_categories = await global.db.groupSettings.find(id, (c) => !!c.cid);
            const o_channels = await global.db.groupSettings.find(id, (c) => !!c.chid);
            const o_roles = await perm.getRoles();
            const o_users = await global.db.usersPerms.find(id, (u) => !!u.uid);
            const o_emojis = await global.db.groupSettings.find(id, (e) => !!e.unicode);

            const pcaci = processCategoriesAndChannelIds(data.categories, data.channels);
            const n_roles = processRolesIds(data.roles);

            const categoriesChanges = processDbChanges(o_categories, pcaci.categories, ["name","i"], "cid");
            const channelsChanges = processDbChanges(o_channels, pcaci.channels, ["name","i","rp"], "chid");
            const rolesChanges = processDbChanges(o_roles, n_roles, ["rid", "parent", "name", "color", "p"], "rid");
            const usersChanges = processDbChanges(o_users, data.users, ["uid", "roles"], "uid");
            const emojisChanges = processDbChanges(o_emojis, data.emojis, ["name"], "unicode");

            await saveDbChanges(id, categoriesChanges, "cid");
            await saveDbChanges(id, channelsChanges, "chid");
            await saveDbChanges(id, rolesChanges, "rid");
            for(const item of usersChanges.itemsToUpdate) await global.db.usersPerms.update(id, (u) => u.uid == item.uid, item);
            await saveDbChanges(id, emojisChanges, "unicode");

            await processEmojis(id, emojisChanges);

            await global.db.groupSettings.updateOne(id, { _id: "set" }, data.meta);

            global.sendToChatUsers(id, "refreshData", { server: id, evt: ["server.setup", "server.roles.sync"] }, id);
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


async function saveDbChanges(doc, changes, idName="_id"){
    const { itemsToAdd, itemsToRemove, itemsToUpdate } = changes;

    for(const item of itemsToAdd) await global.db.groupSettings.add(doc, item, false);
    for(const item of itemsToRemove) await global.db.groupSettings.remove(doc, (r) => r[idName] == item[idName]);
    for(const item of itemsToUpdate) await global.db.groupSettings.update(doc, (r) => r[idName] == item[idName], item);
}

function processCategoriesAndChannelIds(categories, channels){
    for(let i=0; i<categories.length; i++){
        const category = categories[i];
        if(typeof category.cid == "number"){
            const newId = genId();

            const childChannels = channels.filter(c => c.category == category.cid);
            childChannels.forEach(c => c.category = newId);
            categories[i].cid = newId;
        }
    }

    for(let i=0; i<channels.length; i++){
        const channel = channels[i];
        if(typeof channel.chid == "number" || channel.chid == undefined){
            channels[i].chid = genId();
        }
    }

    return { categories, channels };
}

function processRolesIds(roles){
    for(let i=0; i<roles.length; i++){
        const role = roles[i];
        if(typeof role.rid == "number"){
            const newId = genId();
            
            const childRole = roles.find(r => r.parent == role.rid);
            if(childRole) childRole.parent = newId;
            roles[i].rid = newId;
        }
    }

    return roles;
}

async function processEmojis(id, emojisChanges){
    const isEmojisChanged =
        emojisChanges.itemsToAdd.length > 0 || emojisChanges.itemsToRemove.length > 0 || emojisChanges.itemsToUpdate.length > 0;

    if(isEmojisChanged){
        const emojis = await global.db.groupSettings.find(id, (e) => !!e.unicode);
        await emojiMgmt.createFont(emojis, id);
    }

    const basePath = "userFiles/servers/" + id + "/emoji/";
    for(const rmEmoji of emojisChanges.itemsToRemove){
        const path = basePath + rmEmoji.unicode.toString(16) + ".svg";
        if(fs.existsSync(path)){
            fs.unlinkSync(path);
        }
    }
}