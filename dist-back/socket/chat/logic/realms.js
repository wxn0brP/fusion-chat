import InternalCode from "../../../codes/index.js";
import db from "../../../dataBase.js";
import { checkIsUserOnRealm } from "../../../logic/checkIsUserOnRealm.js";
import getChnlPerm from "../../../logic/chnlPermissionCache.js";
import permissionSystem from "../../../logic/permission-system/index.js";
import Permissions from "../../../logic/permission-system/permission.js";
import { clearEventCache } from "../../../logic/sendMessageUtils/announcementChnl.js";
import { getCache as statusMgmtGetCache } from "../../../logic/status.js";
import valid from "../../../logic/validData.js";
import ValidError from "../../../logic/validError.js";
import { addTask, cancelTask } from "../../../schedule/index.js";
import eventCreateData from "../valid/event.js";
const eventCreateSchema = valid.objAjv(eventCreateData);
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
    if (!eventCreateSchema(req))
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVhbG1zLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vYmFjay9zb2NrZXQvY2hhdC9sb2dpYy9yZWFsbXMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxZQUFZLE1BQU0sUUFBUSxDQUFDO0FBQ2xDLE9BQU8sRUFBRSxNQUFNLEtBQUssQ0FBQztBQUNyQixPQUFPLEVBQUUsa0JBQWtCLEVBQUUsTUFBTSwyQkFBMkIsQ0FBQztBQUMvRCxPQUFPLFdBQVcsTUFBTSw0QkFBNEIsQ0FBQztBQUNyRCxPQUFPLGdCQUFnQixNQUFNLGdDQUFnQyxDQUFDO0FBQzlELE9BQU8sV0FBVyxNQUFNLHFDQUFxQyxDQUFDO0FBQzlELE9BQU8sRUFBRSxlQUFlLEVBQUUsTUFBTSwwQ0FBMEMsQ0FBQztBQUMzRSxPQUFPLEVBQUUsUUFBUSxJQUFJLGtCQUFrQixFQUFFLE1BQU0sZUFBZSxDQUFDO0FBQy9ELE9BQU8sS0FBSyxNQUFNLGtCQUFrQixDQUFDO0FBQ3JDLE9BQU8sVUFBVSxNQUFNLG1CQUFtQixDQUFDO0FBQzNDLE9BQU8sRUFBRSxPQUFPLEVBQUUsVUFBVSxFQUFFLE1BQU0sV0FBVyxDQUFDO0FBU2hELE9BQU8sZUFBZSxNQUFNLGdCQUFnQixDQUFDO0FBRTdDLE1BQU0saUJBQWlCLEdBQUcsS0FBSyxDQUFDLE1BQU0sQ0FBQyxlQUFlLENBQUMsQ0FBQztBQUV4RCxNQUFNLENBQUMsS0FBSyxVQUFVLFdBQVcsQ0FBQyxLQUFrQixFQUFFLEVBQU07SUFDeEQsTUFBTSxNQUFNLEdBQUcsSUFBSSxVQUFVLENBQUMsYUFBYSxDQUFDLENBQUM7SUFDN0MsSUFBSSxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDO1FBQUUsT0FBTyxNQUFNLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDO0lBRTdDLE1BQU0sYUFBYSxHQUFHLE1BQU0sa0JBQWtCLENBQUMsS0FBSyxDQUFDLEdBQUcsRUFBRSxFQUFFLENB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