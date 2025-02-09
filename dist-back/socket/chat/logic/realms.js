import valid from "../../../logic/validData.js";
import permissionSystem from "../../../logic/permission-system/index.js";
import Permissions from "../../../logic/permission-system/permission.js";
import ValidError from "../../../logic/validError.js";
import { getCache as statusMgmtGetCache } from "../../../logic/status.js";
import getChnlPerm from "../../../logic/chnlPermissionCache.js";
import { clearEventCache } from "../../../logic/sendMessageUtils/announcementChnl.js";
import db from "../../../dataBase.js";
import eventCreateData from "../valid/event.js";
import { addTask, cancelTask } from "../../../schedule/index.js";
import InternalCode from "../../../codes/index.js";
import { checkIsUserOnRealm } from "../../../logic/checkIsUserOnRealm.js";
const eventCreateSchemat = valid.objAjv(eventCreateData);
export async function realm_setup(suser, id) {
    const validE = new ValidError("realm.setup");
    if (!valid.id(id))
        return validE.valid("id");
    const isUserInRealm = await checkIsUserOnRealm(suser._id, id);
    if (!isUserInRealm)
        return validE.err(InternalCode.UserError.Socket.UserNotOnRealm);
    const realmMeta = await db.realmConf.findOne(id, { _id: "set" });
    if (!realmMeta)
        return validE.err(InternalCode.UserError.Socket.RealmSetup_RealmNotFound);
    const name = realmMeta.name;
    const permSys = new permissionSystem(id);
    const buildChannels = [];
    const categories = await db.realmConf.find(id, { $exists: { cid: true } });
    const channels = await db.realmConf.find(id, { $exists: { chid: true } });
    const sortedCategories = categories.sort((a, b) => a.i - b.i);
    for (let i = 0; i < sortedCategories.length; i++) {
        const category = sortedCategories[i];
        let chnlsByDb = channels
            .filter(c => c.category == category.cid)
            .sort((a, b) => a.i - b.i);
        const allChnls = await Promise.all(chnlsByDb.map(async (c) => {
            const perms = await getChnlPerm(suser._id, id, c.chid);
            if (!perms)
                return null;
            if (!perms.view)
                return null;
            return {
                id: c.chid,
                name: c.name,
                type: c.type,
                perms,
                desc: c.desc,
            };
        }));
        const chnls = allChnls.filter(Boolean);
        if (chnlsByDb.length == 0)
            continue;
        buildChannels.push({
            id: category.cid,
            name: category.name,
            chnls,
        });
    }
    const userPermissions = await permSys.getUserPermissions(suser._id);
    return { err: false, res: [id, name, buildChannels, userPermissions] };
}
export async function realm_users_sync(suser, id) {
    const validE = new ValidError("realm.users.sync");
    if (!valid.id(id))
        return validE.valid("id");
    const isUserInRealm = await checkIsUserOnRealm(suser._id, id);
    if (!isUserInRealm)
        return validE.err(InternalCode.UserError.Socket.UserNotOnRealm);
    const permSys = new permissionSystem(id);
    const roles = await permSys.getAllRolesSorted();
    const rolesData = roles.map(({ name, c }) => { return { name, c }; });
    const rolesMap = new Map();
    for (const role of roles)
        rolesMap.set(role._id, role.name);
    const users = await db.realmUser.find(id, {});
    const usersData = users.map(u => {
        const uid = u.u || u.bot;
        let symbolUID = uid;
        if (u.bot)
            symbolUID = "^" + u.bot;
        return {
            uid: symbolUID,
            roles: u.r.map((r) => rolesMap.get(r)),
        };
    });
    return { err: false, res: [usersData, rolesData] };
}
export async function realm_users_activity_sync(suser, id) {
    const validE = new ValidError("realm.users.activity.sync");
    if (!valid.id(id))
        return validE.valid("id");
    const isUserInRealm = await checkIsUserOnRealm(suser._id, id);
    if (!isUserInRealm)
        return validE.err(InternalCode.UserError.Socket.UserNotOnRealm);
    const users = await db.realmUser.find(id, {});
    const usersData = users.map(async (u) => {
        const uid = u.u || u.bot;
        let symbolUID = uid;
        if (u.bot)
            symbolUID = "^" + u.bot;
        let userOnline = false;
        if (u.u)
            userOnline = global.getSocket(uid).length > 0;
        if (u.bot)
            userOnline = global.getSocket(uid, "bot").length > 0;
        if (!userOnline)
            return { uid: symbolUID };
        const st = await db.userData.findOne(uid, { _id: "status" });
        const statusText = st?.text;
        const status = st?.status || "online";
        return {
            uid: symbolUID,
            activity: statusMgmtGetCache(uid),
            status,
            statusText
        };
    });
    const res = await Promise.all(usersData);
    return { err: false, res: [res] };
}
export async function realm_delete(suser, id, name) {
    const validE = new ValidError("realm.delete");
    if (!valid.id(id))
        return validE.valid("id");
    if (!valid.str(name, 0, 30))
        return validE.valid("name");
    const realmMeta = await db.realmConf.findOne(id, { _id: "set" });
    if (realmMeta.name != name)
        return validE.valid("name");
    const permSys = new permissionSystem(id);
    const userPerm = await permSys.canUserPerformAction(suser._id, Permissions.admin);
    if (!userPerm)
        return validE.err(InternalCode.UserError.Socket.RealmEdit_NotAuthorized);
    const users = await db.realmUser.find(id, {}).then(users => users.map(u => u.u));
    for (const user of users)
        await db.userData.removeOne(user, { realm: id });
    db.realmConf.removeCollection(id);
    db.realmUser.removeCollection(id);
    db.mess.removeCollection(id);
    db.realmData.removeCollection(id);
    for (const user of users)
        global.sendToSocket(user, "refreshData", "realm.get");
    return { err: false };
}
export async function realm_user_kick(suser, realmId, uid, ban = false) {
    const validE = new ValidError("realm.user.kick");
    if (!valid.id(realmId))
        return validE.valid("realmId");
    if (!valid.id(uid))
        return validE.valid("uid");
    if (!valid.bool(ban))
        return validE.valid("ban");
    const permSys = new permissionSystem(realmId);
    const userPerm = await permSys.canUserPerformAnyAction(suser._id, [
        Permissions.admin,
        Permissions.banUser,
        Permissions.kickUser
    ]);
    if (!userPerm)
        return validE.err(InternalCode.UserError.Socket.RealmEdit_NotAuthorized);
    await db.userData.removeOne(uid, { realm: realmId });
    await db.realmUser.removeOne(realmId, { uid });
    if (ban) {
        await db.realmUser.add(realmId, { ban: uid }, false);
    }
    global.sendToSocket(uid, "refreshData", "realm.get");
    return { err: false };
}
export async function realm_user_unban(suser, realmId, uid) {
    const validE = new ValidError("realm.user.unban");
    if (!valid.id(realmId))
        return validE.valid("realmId");
    if (!valid.id(uid))
        return validE.valid("uid");
    const perm = new permissionSystem(realmId);
    const userPerm = await perm.canUserPerformAnyAction(suser._id, [
        Permissions.admin,
        Permissions.banUser
    ]);
    if (!userPerm)
        return validE.err(InternalCode.UserError.Socket.RealmEdit_NotAuthorized);
    await db.realmUser.removeOne(realmId, { ban: uid });
    return { err: false };
}
export async function realm_emojis_sync(suser, realmId) {
    const validE = new ValidError("realm.emojis.sync");
    if (!valid.id(realmId))
        return validE.valid("realmId");
    const isUserInRealm = await checkIsUserOnRealm(suser._id, realmId);
    if (!isUserInRealm)
        return validE.err(InternalCode.UserError.Socket.UserNotOnRealm);
    const emojis = await db.realmConf.find(realmId, { $exists: { emoji: true } });
    return { err: false, res: [emojis] };
}
export async function realm_announcement_channel_subscribe(suser, sourceRealmId, sourceChannelId, targetRealmId, targetChannelId) {
    const validE = new ValidError("realm.announcement.channel.subscribe");
    if (!valid.id(sourceRealmId))
        return validE.valid("sourceRealmId");
    if (!valid.id(sourceChannelId))
        return validE.valid("sourceChannelId");
    if (!valid.id(targetRealmId))
        return validE.valid("targetRealmId");
    if (!valid.id(targetChannelId))
        return validE.valid("targetChannelId");
    const permSys = new permissionSystem(targetRealmId);
    const userPerm = await permSys.canUserPerformAction(suser._id, Permissions.admin);
    if (!userPerm)
        return validE.err(InternalCode.UserError.Socket.RealmEdit_NotAuthorized);
    const data = {
        sr: sourceRealmId,
        sc: sourceChannelId,
        tr: targetRealmId,
        tc: targetChannelId
    };
    const exists = await db.realmData.findOne("announcement.channels", data);
    if (exists)
        return validE.err(InternalCode.UserError.Socket.RealmAnnouncementSubscribe_AlreadySubscribed);
    await db.realmData.add("announcement.channels", data, false);
    clearEventCache(targetRealmId);
    return { err: false };
}
export async function realm_announcement_channel_unsubscribe(suser, sourceRealmId, sourceChannelId, targetRealmId, targetChannelId) {
    const validE = new ValidError("realm.announcement.channel.unsubscribe");
    if (!valid.id(sourceRealmId))
        return validE.valid("sourceRealmId");
    if (!valid.id(sourceChannelId))
        return validE.valid("sourceChannelId");
    if (!valid.id(targetRealmId))
        return validE.valid("targetRealmId");
    if (!valid.id(targetChannelId))
        return validE.valid("targetChannelId");
    const permSys = new permissionSystem(targetRealmId);
    const userPerm = await permSys.canUserPerformAction(suser._id, Permissions.admin);
    if (!userPerm)
        return validE.err(InternalCode.UserError.Socket.RealmEdit_NotAuthorized);
    await db.realmData.removeOne("announcement.channels", {
        sr: sourceRealmId,
        sc: sourceChannelId,
        tr: targetRealmId,
        tc: targetChannelId
    });
    clearEventCache(targetRealmId);
    return { err: false };
}
export async function realm_announcement_channel_available(suser) {
    const userRealms = await db.userData.find(suser._id, { $exists: { realm: true } });
    const realmsWithAdmin = [];
    for (const userRealmId of userRealms) {
        const permSys = new permissionSystem(userRealmId.realm);
        const userPerm = await permSys.canUserPerformAction(suser._id, Permissions.admin);
        if (userPerm)
            realmsWithAdmin.push(userRealmId.realm);
    }
    return { err: false, res: [realmsWithAdmin] };
}
export async function realm_announcement_channel_list(suser, realmId) {
    const validE = new ValidError("realm.announcement.channel.list");
    if (!valid.id(realmId))
        return validE.valid("realmId");
    const isUserInRealm = await checkIsUserOnRealm(suser._id, realmId);
    if (!isUserInRealm)
        return validE.err(InternalCode.UserError.Socket.UserNotOnRealm);
    const permSys = new permissionSystem(realmId);
    const userPerm = await permSys.canUserPerformAction(suser._id, Permissions.admin);
    if (!userPerm)
        return validE.err(InternalCode.UserError.Socket.RealmEdit_NotAuthorized);
    const subscribedChannels = await db.realmData.find("announcement.channels", { tr: realmId });
    const channels = await db.realmConf.find(realmId, {
        $exists: {
            chid: true
        },
        $in: {
            type: ["text", "announcement", "open_announcement"]
        }
    }, {}, {}, {
        select: ["chid", "name"]
    }).then(channels => {
        const availableChannels = [];
        for (const channel of channels) {
            if (subscribedChannels.some(tc => tc.sc == channel.chid))
                continue;
            if (subscribedChannels.some(tc => tc.tc == channel.chid))
                continue;
            availableChannels.push(channel);
        }
        return availableChannels;
    });
    return { err: false, res: [channels] };
}
export async function realm_thread_create(suser, realmId, channelId, name, replyMsgId = null) {
    const validE = new ValidError("realm.thread.create");
    if (!valid.id(realmId))
        return validE.valid("realmId");
    if (!valid.id(channelId))
        return validE.valid("channelId");
    if (!valid.str(name, 0, 30))
        return validE.valid("name");
    if (replyMsgId && !valid.id(replyMsgId))
        return validE.valid("replyMsgId");
    const chnlType = await db.realmConf.findOne(realmId, { chid: channelId });
    if (!chnlType)
        return validE.valid("channelId");
    if (chnlType.type != "forum") {
        const perms = await getChnlPerm(suser._id, realmId, channelId);
        if (!perms.threadCreate)
            return validE.err(InternalCode.UserError.Socket.RealmEdit_NotAuthorized);
    }
    const threadObj = {
        thread: channelId,
        name,
        author: suser._id,
    };
    if (replyMsgId)
        threadObj.reply = replyMsgId;
    const thread = await db.realmData.add(realmId, threadObj, true);
    return { err: false, res: [thread._id] };
}
export async function realm_thread_delete(suser, realmId, threadId) {
    const validE = new ValidError("realm.thread.delete");
    if (!valid.id(realmId))
        return validE.valid("realmId");
    if (!valid.id(threadId))
        return validE.valid("threadId");
    const perms = await getChnlPerm(suser._id, realmId, threadId);
    if (!perms.threadCreate)
        return validE.err(InternalCode.UserError.Socket.RealmEdit_NotAuthorized);
    const thread = await db.realmData.findOne(realmId, { _id: threadId });
    if (!thread)
        return validE.err(InternalCode.UserError.Socket.ThreadDelete_NotFound);
    if (thread.author != suser._id) {
        const permSys = new permissionSystem(realmId);
        const canAdmin = await permSys.canUserPerformAction(suser._id, Permissions.admin);
        if (!canAdmin)
            return validE.err(InternalCode.UserError.Socket.RealmEdit_NotAuthorized);
    }
    await db.realmData.removeOne(realmId, { _id: threadId });
    await db.mess.remove(realmId, { chnl: "&" + threadId });
    global.sendToChatUsers(realmId, "realm.thread.delete", threadId);
    return { err: false };
}
export async function realm_thread_list(suser, realmId, channelId) {
    const validE = new ValidError("realm.thread.list");
    if (!valid.id(realmId))
        return validE.valid("realmId");
    if (!valid.id(channelId) && channelId != null)
        return validE.valid("channelId");
    const isUserInRealm = await checkIsUserOnRealm(suser._id, realmId);
    if (!isUserInRealm)
        return validE.err(InternalCode.UserError.Socket.UserNotOnRealm);
    if (channelId === null) {
        const threads = await db.realmData.find(realmId, { $exists: { thread: true } });
        const chnlCache = {};
        const cpu_threads = threads.map(async (t) => {
            async function getChnlType() {
                if (t.thread in chnlCache)
                    return chnlCache[t.thread];
                const chnl = await db.realmConf.findOne(realmId, { chid: t.thread });
                chnlCache[t.thread] = chnl.type;
                return chnl.type;
            }
            const type = await getChnlType();
            if (type === "forum")
                return false;
            const perms = await getChnlPerm(suser._id, realmId, t.thread);
            return perms.threadView ? t : false;
        });
        const threadsWithPerms = await Promise.all(cpu_threads);
        const filtered = threadsWithPerms.filter(Boolean);
        return { err: false, res: [filtered] };
    }
    const perms = await getChnlPerm(suser._id, realmId, channelId);
    if (!perms.threadView)
        return validE.err(InternalCode.UserError.Socket.RealmThreadList_NotAuthorized);
    const threads = await db.realmData.find(realmId, { thread: channelId });
    return { err: false, res: [threads] };
}
export async function realm_event_create(suser, realmId, req) {
    const validE = new ValidError("realm.event.create");
    if (!valid.id(realmId))
        return validE.valid("realmId");
    if (!eventCreateSchemat(req))
        return validE.valid("req");
    if (req.type === "voice") {
        if (!valid.id(req.where))
            return validE.valid("req.where");
        const chnl = await db.realmConf.findOne(realmId, { chid: req.where });
        if (!chnl)
            return validE.valid("req.where");
        if (chnl.type !== "voice")
            return validE.valid("req.where");
    }
    const actualTime = Date.now();
    if (req.time * 1000 <= actualTime + 60_000)
        return validE.valid("req.time");
    const permSys = new permissionSystem(realmId);
    const canAdmin = await permSys.canUserPerformAction(suser._id, Permissions.admin);
    if (!canAdmin)
        return validE.err(InternalCode.UserError.Socket.RealmEdit_NotAuthorized);
    const data = {
        evt: true,
        type: req.type,
        where: req.where,
        time: req.time,
        author: suser._id,
        topic: req.topic,
    };
    if (req.desc)
        data.desc = req.desc;
    if (req.img)
        data.img = req.img;
    const { _id } = await db.realmData.add(realmId, data);
    const task = {
        type: "event",
        data: {
            realm: realmId,
            evt: _id
        },
        sTime: req.time,
        sType: "one-time",
    };
    addTask(task);
    return { err: false };
}
export async function realm_event_delete(suser, realmId, eventId) {
    const validE = new ValidError("realm.event.delete");
    if (!valid.id(realmId))
        return validE.valid("realmId");
    if (!valid.id(eventId))
        return validE.valid("eventId");
    const permSys = new permissionSystem(realmId);
    const canAdmin = await permSys.canUserPerformAction(suser._id, Permissions.admin);
    if (!canAdmin)
        return validE.err(InternalCode.UserError.Socket.RealmEdit_NotAuthorized);
    const taskId = await db.system.findOne("tasks", { type: "event", data: { evt: eventId } });
    if (taskId)
        await cancelTask(taskId._id);
    await db.realmData.removeOne(realmId, { _id: eventId, evt: true });
    await db.realmData.remove(realmId, { uevt: eventId });
    return { err: false };
}
export async function realm_event_list(suser, realmId, len = false) {
    const validE = new ValidError("realm.event.list");
    if (!valid.id(realmId))
        return validE.valid("realmId");
    const isUserInRealm = await checkIsUserOnRealm(suser._id, realmId);
    if (!isUserInRealm)
        return validE.err(InternalCode.UserError.Socket.UserNotOnRealm);
    const events = await db.realmData.find(realmId, { evt: true });
    if (len)
        return { err: false, res: [events.length] };
    const eventsUsers = await db.realmData.find(realmId, { $exists: { uevt: true } });
    const data = [];
    for (const event of events) {
        const users = eventsUsers.filter((ev) => ev.uevt === event._id);
        data.push({
            ...event,
            users: users.map((ev) => ev.u),
        });
    }
    return { err: false, res: [data] };
}
export async function realm_event_join(suser, realmId, eventId) {
    const validE = new ValidError("realm.event.join");
    if (!valid.id(realmId))
        return validE.valid("realmId");
    if (!valid.id(eventId))
        return validE.valid("eventId");
    const isUserInRealm = await checkIsUserOnRealm(suser._id, realmId);
    if (!isUserInRealm)
        return validE.err(InternalCode.UserError.Socket.UserNotOnRealm);
    const joined = await db.realmData.findOne(realmId, { u: suser._id, uevt: eventId });
    if (joined)
        return validE.err(InternalCode.UserError.Socket.RealmEventJoin_AlreadyJoined);
    await db.realmData.add(realmId, { u: suser._id, uevt: eventId });
    return { err: false };
}
export async function realm_event_leave(suser, realmId, eventId) {
    const validE = new ValidError("realm.event.leave");
    if (!valid.id(realmId))
        return validE.valid("realmId");
    if (!valid.id(eventId))
        return validE.valid("eventId");
    const isUserInRealm = await checkIsUserOnRealm(suser._id, realmId);
    if (!isUserInRealm)
        return validE.err(InternalCode.UserError.Socket.UserNotOnRealm);
    await db.realmData.removeOne(realmId, { u: suser._id, uevt: eventId });
    return { err: false };
}
export async function realm_event_get_topic(suser, realmId, eventId) {
    const validE = new ValidError("realm.event.get.topic");
    if (!valid.id(realmId))
        return validE.valid("realmId");
    if (!valid.id(eventId))
        return validE.valid("eventId");
    const isUserInRealm = await checkIsUserOnRealm(suser._id, realmId);
    if (!isUserInRealm)
        return validE.err(InternalCode.UserError.Socket.UserNotOnRealm);
    const event = await db.realmData.findOne(realmId, { _id: eventId, evt: true });
    if (!event)
        return validE.err(InternalCode.UserError.Socket.RealmEventGetTopic_NotFound);
    return { err: false, res: [event.topic] };
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVhbG1zLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vYmFjay9zb2NrZXQvY2hhdC9sb2dpYy9yZWFsbXMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxLQUFLLE1BQU0sMEJBQTBCLENBQUM7QUFDN0MsT0FBTyxnQkFBZ0IsTUFBTSx3Q0FBd0MsQ0FBQztBQUN0RSxPQUFPLFdBQVcsTUFBTSw2Q0FBNkMsQ0FBQztBQUV0RSxPQUFPLFVBQVUsTUFBTSwyQkFBMkIsQ0FBQztBQUNuRCxPQUFPLEVBQUUsUUFBUSxJQUFJLGtCQUFrQixFQUFFLE1BQU0sdUJBQXVCLENBQUM7QUFDdkUsT0FBTyxXQUFXLE1BQU0sb0NBQW9DLENBQUM7QUFDN0QsT0FBTyxFQUFFLGVBQWUsRUFBRSxNQUFNLGtEQUFrRCxDQUFDO0FBQ25GLE9BQU8sRUFBRSxNQUFNLG1CQUFtQixDQUFDO0FBUW5DLE9BQU8sZUFBZSxNQUFNLGdCQUFnQixDQUFDO0FBRTdDLE9BQU8sRUFBRSxPQUFPLEVBQUUsVUFBVSxFQUFFLE1BQU0sbUJBQW1CLENBQUM7QUFDeEQsT0FBTyxZQUFZLE1BQU0sZ0JBQWdCLENBQUM7QUFDMUMsT0FBTyxFQUFFLGtCQUFrQixFQUFFLE1BQU0sbUNBQW1DLENBQUM7QUFFdkUsTUFBTSxrQkFBa0IsR0FBRyxLQUFLLENBQUMsTUFBTSxDQUFDLGVBQWUsQ0FBQyxDQUFDO0FBRXpELE1BQU0sQ0FBQyxLQUFLLFVBQVUsV0FBVyxDQUFDLEtBQWtCLEVBQUUsRUFBTTtJQUN4RCxNQUFNLE1BQU0sR0FBRyxJQUFJLFVBQVUsQ0FBQyxhQUFhLENBQUMsQ0FBQztJQUM3QyxJQUFJLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUM7UUFBRSxPQUFPLE1BQU0sQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUM7SUFFN0MsTUFBTSxhQUFhLEdBQUcsTUFBTSxrQkFBa0IsQ0FBQyxLQUFLLENBQUMsR0FBRyxFQUFF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