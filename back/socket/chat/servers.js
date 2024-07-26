const valid = require("../../logic/validData");
const permissionSystem = require("../../logic/permission-system");
const genId = require("../../db/gen");
const processDbChanges = require("../../logic/processDbChanges");

module.exports = (socket) => {
    socket.ontimeout("setUpServer", 100, async (id) => {
        try{
            if(!socket.user) return socket.emit("error", "not auth");
            if(!valid.str(id, 0, 30)) return socket.emit("error", "valid data");

            const serverMeta = await global.db.groupSettings.findOne(id, { _id: "set" });
            const name = serverMeta.name;

            const buildChannels = [];
            const categories = await global.db.groupSettings.find(id, (r) => !!r.cid);
            const channels = await global.db.groupSettings.find(id, (r) => !!r.chid);
            const sortedCategories = categories.sort((a, b) => a.i - b.i);

            for(let i=0; i<sortedCategories.length; i++){
                const category = sortedCategories[i];
                let chnls = channels.filter(c => c.category == category.cid);
                chnls = chnls.sort((a, b) => a.i - b.i);
                chnls = chnls.map(c => {
                    return {
                        id: c.chid,
                        name: c.name,
                        type: c.type,
                    }
                });

                buildChannels.push({
                    id: category.cid,
                    name: category.name,
                    chnls: chnls,
                });
            }

            socket.emit("setUpServer", id, name, buildChannels);
        }catch(e){
            socket.logError(e);
        }
    });

    socket.ontimeout("getSeverSettings", 5_000, async (id) => {
        try{
            if(!socket.user) return socket.emit("error", "not auth");
            if(!valid.str(id, 0, 30)) return socket.emit("error", "valid data");

            const perm = new permissionSystem(id);
            const userPerm = await perm.userPermison(socket.user._id, "admin");
            if(!userPerm) return socket.emit("error", "You don't have permission to edit this server");

            const meta = await global.db.groupSettings.findOne(id, { _id: "set" });
            const categories = await global.db.groupSettings.find(id, (r) => !!r.cid);
            const channels = await global.db.groupSettings.find(id, (r) => !!r.chid);
            const roles = await perm.getRoles();
            const users = await global.db.usersPerms.find(id, (r) => !!r.uid);

            const data = {
                meta,
                categories,
                channels,
                roles,
                users: users.map(u => { return { uid: u.uid, roles: u.roles }}),
            };

            socket.emit("getSeverSettings", data, id);
        }catch(e){
            socket.logError(e);
        }
    });

    socket.ontimeout("setSeverSettings", 5_000, async (id, data) => {
        try{
            if(!socket.user) return socket.emit("error", "not auth");
            if(!valid.str(id, 0, 30)) return socket.emit("error", "valid data");

            const perm = new permissionSystem(id);
            const userPerm = await perm.userPermison(socket.user._id, "admin");
            if(!userPerm) return socket.emit("error", "You don't have permission to edit this server");

            const o_categories = await global.db.groupSettings.find(id, (r) => !!r.cid);
            const o_channels = await global.db.groupSettings.find(id, (r) => !!r.chid);
            const o_roles = await perm.getRoles();
            const o_users = await global.db.usersPerms.find(id, (r) => !!r.uid);

            const pcaci = processCategoriesAndChannelIds(data.categories, data.channels);
            const n_roles = processRolesIds(data.roles);

            const categoriesChanges = processDbChanges(o_categories, pcaci.categories, ["name","i"], "cid");
            const channelsChanges = processDbChanges(o_channels, pcaci.channels, ["name","i"], "chid");
            const rolesChanges = processDbChanges(o_roles, n_roles, ["rid", "parent", "name"], "rid");
            const usersChanges = processDbChanges(o_users, data.users, ["uid", "roles"], "uid");

            await saveDbChanges(id, categoriesChanges, "cid");
            await saveDbChanges(id, channelsChanges, "chid");
            await saveDbChanges(id, rolesChanges, "rid");
            for(const item of usersChanges.itemsToUpdate) await global.db.usersPerms.update(id, (u) => u.uid == item.uid, item);

            await global.db.groupSettings.updateOne(id, { _id: "set" }, data.meta);
        }catch(e){
            socket.logError(e);
        }
    });

    socket.ontimeout("updateDataOfServer", 1000, async (id) => {
        try{
            if(!socket.user) return socket.emit("error", "not auth");
            if(!valid.str(id, 0, 30)) return socket.emit("error", "valid data");
        
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

            socket.emit("updateDataOfServer", usersData, rolesData);
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