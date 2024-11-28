import valid from "../../../logic/validData.js";
import permissionSystem from "../../../logic/permission-system/index.js";
import Permissions from "../../../logic/permission-system/permBD.js";
import { existsSync } from "fs";
import ValidError from "../../../logic/validError.js";
import { getCache as statusMgmtGetCache } from "../../../logic/status.js";

export async function realm_setup(suser, id){
    const validE = new ValidError("realm.setup");
    if(!valid.id(id)) return validE.valid("id");

    const serverMeta = await global.db.realmConf.findOne(id, { _id: "set" });
    if(!serverMeta) return validE.err("server does not exist");
    
    const name = serverMeta.name;
    const permSys = new permissionSystem(id);
    const roles = await permSys.getUserRolesSorted(suser._id);
    const admin = await permSys.canUserPerformAction(suser._id, Permissions.admin);

    const buildChannels = [];
    const categories = await global.db.realmConf.find(id, { $exists: { cid: true }});
    const channels = await global.db.realmConf.find(id, { $exists: { chid: true }});
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
    const userPermissions = await permSys.getUserPermissions(suser._id);

    return { err: false, res: [id, name, buildChannels, isOwnEmoji, userPermissions] };
}

export async function realm_users_sync(id){
    const validE = new ValidError("realm.users.sync");
    if(!valid.id(id)) return validE.valid("id");

    const permSys = new permissionSystem(id);
    const roles = await permSys.getAllRolesSorted();
    const rolesData = roles.map(({ name, c }) => { return { name, c }});

    const rolesMap = new Map();
    for(const role of roles) rolesMap.set(role.rid, role.name);

    const users = await global.db.realmUser.find(id, {});
    const usersData = users.map(u => {
        return {
            uid: u.u,
            roles: u.r.map(r => rolesMap.get(r)),
            activity: statusMgmtGetCache(u.u)
        }
    });

    return { err: false, res: [usersData, rolesData] };
}

export async function realm_delete(suser, id, name){
    const validE = new ValidError("realm.delete");
    if(!valid.id(id)) return validE.valid("id");
    if(!valid.str(name, 0, 30)) return validE.valid("name");

    const serverMeta = await global.db.realmConf.findOne(id, { _id: "set" });
    if(serverMeta.name != name) return validE.valid("name");

    const permSys = new permissionSystem(id);
    const userPerm = await permSys.canUserPerformAction(suser._id, Permissions.admin);
    if(!userPerm) return validE.err("You don't have permission to edit this server");

    const users = await global.db.realmUser.find(id, {}).then(users => users.map(u => u.u));
    for(const user of users) await global.db.userData.removeOne(user, { realm: id });

    global.db.realmConf.removeCollection(id);
    global.db.realmUser.removeCollection(id);
    global.db.mess.removeCollection(id);
    global.db.realmData.removeCollection(id);

    for(const user of users) global.sendToSocket(user, "refreshData", "realm.get");

    return { err: false };
}

export async function realm_user_kick(suser, realmId, uid, ban=false){
    const validE = new ValidError("realm.user.kick");
    if(!valid.id(realmId)) return validE.valid("realmId");
    if(!valid.id(uid)) return validE.valid("uid");
    if(!valid.bool(ban)) return validE.valid("ban");

    const permSys = new permissionSystem(realmId);
    const userPerm = await permSys.canUserPerformAnyAction(suser._id, [
        Permissions.admin,
        Permissions.banUser,
        Permissions.kickUser
    ]);
    if(!userPerm) return validE.err("You don't have permission to edit this server");

    await global.db.userData.removeOne(uid, { realm: realmId });
    await global.db.realmUser.removeOne(realmId, { uid });
    
    if(ban){
        await global.db.realmUser.add(realmId, { ban: uid }, false);
    }

    global.sendToSocket(uid, "refreshData", "realm.get");

    return { err: false };
}

export async function realm_user_unban(suser, realmId, uid){
    const validE = new ValidError("realm.user.unban");
    if(!valid.id(realmId)) return validE.valid("realmId");
    if(!valid.id(uid)) return validE.valid("uid");

    const perm = new permissionSystem(realmId);
    const userPerm = await perm.canUserPerformAnyAction(suser._id, [
        Permissions.admin,
        Permissions.banUser
    ]);
    if(!userPerm) return validE.err("You don't have permission to edit this server");

    await global.db.realmUser.removeOne(realmId, { ban: uid });
    return { err: false };
}

export async function realm_emojis_sync(realmId){
    const validE = new ValidError("realm.emojis.sync");
    if(!valid.id(realmId)) return validE.valid("realmId");

    const emojis = await global.db.realmConf.find(realmId, { $exists: { unicode: true }});
    return { err: false, res: emojis };
}