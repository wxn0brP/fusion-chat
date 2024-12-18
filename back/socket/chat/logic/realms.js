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

    const buildChannels = [];
    const categories = await global.db.realmConf.find(id, { $exists: { cid: true }});
    const channels = await global.db.realmConf.find(id, { $exists: { chid: true }});
    const sortedCategories = categories.sort((a, b) => a.i - b.i);

    for(let i=0; i<sortedCategories.length; i++){
        const category = sortedCategories[i];
        let chnls = channels.filter(c => c.category == category.cid);
        chnls = chnls.sort((a, b) => a.i - b.i);
        chnls = await Promise.all(chnls.map(async c => {
            const perms = await global.getChnlPerm(suser._id, id, c.chid);
            if(!perms) return null;

            if(!perms.view) return null;

            return {
                id: c.chid,
                name: c.name,
                type: c.type,
                perms,
                desc: c.desc,
            }
        }))
        chnls = chnls.filter(c => !!c);

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
        const uid = u.u || u.bot;
        let symbolUID = uid;
        if(u.bot) symbolUID = "^" + u.bot;

        return {
            uid: symbolUID,
            roles: u.r.map(r => rolesMap.get(r)),
            activity: statusMgmtGetCache(uid),
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

export async function realm_event_channel_subscribe(suser, sourceRealmId, sourceChannelId, targetRealmId, targetChannelId){
    const validE = new ValidError("realm.event.channel.subscribe");
    if(!valid.id(sourceRealmId))    return validE.valid("sourceRealmId");
    if(!valid.id(sourceChannelId))  return validE.valid("sourceChannelId");
    if(!valid.id(targetRealmId))    return validE.valid("targetRealmId");
    if(!valid.id(targetChannelId))  return validE.valid("targetChannelId");

    const permSys = new permissionSystem(targetRealmId);
    const userPerm = await permSys.canUserPerformAction(suser._id, Permissions.admin);
    if(!userPerm) return validE.err("You don't have permission to edit this server");

    const data = {
        sr: sourceRealmId,
        sc: sourceChannelId,
        tr: targetRealmId,
        tc: targetChannelId
    }

    const exists = await global.db.realmData.findOne("events.channels", data);
    if(exists) return validE.err("already exists");
    
    await global.db.realmData.add("events.channels", data, false);

    return { err: false };
}

export async function realm_event_channel_unsubscribe(suser, sourceRealmId, sourceChannelId, targetRealmId, targetChannelId){
    const validE = new ValidError("realm.event.channel.unsubscribe");
    if(!valid.id(sourceRealmId))    return validE.valid("sourceRealmId");
    if(!valid.id(sourceChannelId))  return validE.valid("sourceChannelId");
    if(!valid.id(targetRealmId))    return validE.valid("targetRealmId");
    if(!valid.id(targetChannelId))  return validE.valid("targetChannelId");

    const permSys = new permissionSystem(targetRealmId);
    const userPerm = await permSys.canUserPerformAction(suser._id, Permissions.admin);
    if(!userPerm) return validE.err("You don't have permission to edit this server");

    await global.db.realmData.removeOne("events.channels", {
        sr: sourceRealmId,
        sc: sourceChannelId,
        tr: targetRealmId,
        tc: targetChannelId
    });

    return { err: false };
}

export async function realm_event_channel_available(suser){
    const userRealms = await global.db.userData.find(suser._id, { $exists: { realm: true }});
    const realmsWithAdmin = [];
    for(const userRealmId of userRealms){
        const permSys = new permissionSystem(userRealmId.realm);
        const userPerm = await permSys.canUserPerformAction(suser._id, Permissions.admin);
        if(userPerm) realmsWithAdmin.push(userRealmId.realm);
    }

    return { err: false, res: realmsWithAdmin };
}

export async function realm_event_channel_list(suser, realmId){
    const validE = new ValidError("realm.event.channel.list");
    if(!valid.id(realmId)) return validE.valid("realmId");

    const permSys = new permissionSystem(realmId);
    const userPerm = await permSys.canUserPerformAction(suser._id, Permissions.admin);
    if(!userPerm) return validE.err("You don't have permission to edit this server");

    const subscribedChannels = await global.db.realmData.find("events.channels", { tr: realmId });
    const channels = await global.db.realmConf.find(
        realmId,
        {
            $exists: {
                chid: true
            },
            $in: {
                type: ["text", "realm_event", "open_event"]
            }
        },
        {},
        {},
        {
            select: ["chid", "name"]
        }
    ).then(channels => {
        const availableChannels = [];
        for(const channel of channels){
            if(subscribedChannels.some(tc => tc.sc == channel.chid)) continue; // no subscription to self
            if(subscribedChannels.some(tc => tc.tc == channel.chid)) continue; // already subscribed
            availableChannels.push(channel);
        }
        return availableChannels;
    });
    return { err: false, res: channels };
}

export async function realm_thread_create(suser, realmId, channelId, name, replyMsgId=null){
    const validE = new ValidError("realm.thread.create");
    if(!valid.id(realmId)) return validE.valid("realmId");
    if(!valid.id(channelId)) return validE.valid("channelId");
    if(!valid.str(name, 0, 30)) return validE.valid("name");
    if(replyMsgId && !valid.id(replyMsgId)) return validE.valid("replyMsgId");

    const perms = await global.getChnlPerm(suser._id, realmId, channelId);
    if(!perms.threadCreate) return validE.err("You don't have permission to edit this server");

    const threadObj = {
        thread: channelId,
        name,
        author: suser._id
    }
    if(replyMsgId) threadObj.reply = replyMsgId;

    const thread = await global.db.realmData.add(realmId, threadObj, true);
    await global.db.realmConf.updateOne(realmId, { chid: thread.thread }, (data, ctx) => {
        data.threads = data.threads || [];
        data.threads.push(ctx._id);
        return data; 
    }, false);

    return { err: false, res: thread._id };
}

export async function realm_thread_delete(suser, realmId, threadId){
    const validE = new ValidError("realm.thread.delete");
    if(!valid.id(realmId)) return validE.valid("realmId");
    if(!valid.id(threadId)) return validE.valid("threadId");

    const perms = await global.getChnlPerm(suser._id, realmId, threadId);
    if(!perms.threadCreate) return validE.err("You don't have permission to edit this server");
    
    const thread = await global.db.realmData.findOne(realmId, { _id: threadId });
    if(!thread) return validE.err("thread does not exist");

    if(thread.author != suser._id){
        const permSys = new permissionSystem(realmId);
        const canAdmin = await permSys.canUserPerformAction(suser._id, Permissions.admin);
        if(!canAdmin) return validE.err("you are not the author"); // if admin, can delete any thread
    }

    await global.db.realmData.removeOne(realmId, { _id: threadId });
    await global.db.realmConf.updateOne(realmId, { chid: thread.thread }, (data, ctx) => {
        data.threads = (data.threads || []).filter(id => id != ctx._id);
        return data; 
    }, false);
    await global.db.mess.remove(realmId, { chnl: "&"+threadId });
    global.sendToChatUsers(realmId, "realm.thread.delete", threadId);

    return { err: false };
}

export async function realm_thread_list(suser, realmId, channelId){
    const validE = new ValidError("realm.thread.list");
    if(!valid.id(realmId)) return validE.valid("realmId");
    if(!valid.id(channelId)) return validE.valid("channelId");

    const perms = await global.getChnlPerm(suser._id, realmId, channelId);
    if(!perms.threadView) return validE.err("You don't have permission to edit this server");

    const threads = await global.db.realmData.find(realmId, { thread: channelId });
    return { err: false, res: threads };
}
