import valid from "../../../logic/validData.js";
import permissionSystem from "../../../logic/permission-system/index.js";
import { existsSync } from "fs";
import ValidError from "../../../logic/validError.js";

export async function server_setup(suser, id){
    const validE = new ValidError("server.setup");
    if(!valid.id(id)) return validE.valid("id");

    const serverMeta = await global.db.groupSettings.findOne(id, { _id: "set" });
    if(!serverMeta) return validE.err("server does not exist");
    
    const name = serverMeta.name;
    const permission = new permissionSystem(id);
    const roles = await permission.getUserRoles(suser._id);
    const admin = await permission.userPermison(suser._id, "all");

    const buildChannels = [];
    const categories = await global.db.groupSettings.find(id, { $exists: { cid: true }});
    const channels = await global.db.groupSettings.find(id, { $exists: { chid: true }});
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
                desc: c.desc,
            }
        }).filter(c => !!c);

        if(chnls.length == 0) continue;
        buildChannels.push({
            id: category.cid,
            name: category.name,
            chnls: chnls,
        });
    }

    const isOwnEmoji = existsSync("userFiles/emoji/" + id + ".ttf");
    const userPermissions = await permission.getUserRolesPerms(suser._id);

    return { err: false, res: [id, name, buildChannels, isOwnEmoji, userPermissions] };
}

export async function server_roles_sync(id){
    const validE = new ValidError("server.roles.sync");
    if(!valid.id(id)) return validE.valid("id");

    const perm = new permissionSystem(id);
    const roles = await perm.getRoles();
    const rolesData = roles.map(({ name, color }) => { return { name, color }});

    const rolesMap = new Map();
    for(const role of roles) rolesMap.set(role.rid, role.name);

    const users = await global.db.usersPerms.find(id, { $exists: { uid: true } });
    const usersData = users.map(u => {
        return {
            uid: u.uid,
            roles: u.roles.map(r => rolesMap.get(r)),
        }
    });

    return { err: false, res: [usersData, rolesData] };
}

export async function server_delete(suser, id, name){
    const validE = new ValidError("server.delete");
    if(!valid.id(id)) return validE.valid("id");
    if(!valid.str(name, 0, 30)) return validE.valid("name");

    const serverMeta = await global.db.groupSettings.findOne(id, { _id: "set" });
    if(serverMeta.name != name) return validE.valid("name");

    const perm = new permissionSystem(id);
    const userPerm = await perm.userPermison(suser._id, "manage server");
    if(!userPerm) return validE.err("You don't have permission to edit this server");

    const users = await global.db.usersPerms.find(id, {}).then(users => users.map(u => u.uid));
    for(const user of users) await global.db.userDatas.removeOne(user, { group: id });

    global.db.groupSettings.removeCollection(id);
    global.db.usersPerms.removeCollection(id);
    global.db.mess.removeCollection(id);
    global.db.groupData.removeCollection(id);

    for(const user of users) global.sendToSocket(user, "refreshData", "group.get");

    return { err: false };
}

export async function server_user_kick(suser, serverId, uid, ban=false){
    const validE = new ValidError("server.user.kick");
    if(!valid.id(serverId)) return validE.valid("serverId");
    if(!valid.id(uid)) return validE.valid("uid");
    if(!valid.bool(ban)) return validE.valid("ban");

    const perm = new permissionSystem(serverId);
    const userPerm = await perm.userPermison(suser._id, "manage server");
    if(!userPerm) return validE.err("You don't have permission to edit this server");

    await global.db.userDatas.removeOne(uid, { group: serverId });
    await global.db.usersPerms.removeOne(serverId, { uid });
    
    if(ban){
        await global.db.usersPerms.add(serverId, { ban: uid }, false);
    }

    global.sendToSocket(uid, "refreshData", "group.get");

    return { err: false };
}

export async function server_user_unban(suser, serverId, uid){
    const validE = new ValidError("server.user.unban");
    if(!valid.id(serverId)) return validE.valid("serverId");
    if(!valid.id(uid)) return validE.valid("uid");

    const perm = new permissionSystem(serverId);
    const userPerm = await perm.userPermison(suser._id, "manage server");
    if(!userPerm) return validE.err("You don't have permission to edit this server");

    await global.db.usersPerms.removeOne(serverId, { ban: uid });
    return { err: false };
}

export async function server_emojis_sync(serverId){
    const validE = new ValidError("server.emojis.sync");
    if(!valid.id(serverId)) return validE.valid("serverId");

    const emojis = await global.db.groupSettings.find(serverId, { $exists: { unicode: true }});
    return { err: false, res: emojis };
}