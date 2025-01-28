import valid from "../../../logic/validData";
import permissionSystem from "../../../logic/permission-system/index";
import Permissions from "../../../logic/permission-system/permBD";
import { existsSync } from "fs";
import ValidError from "../../../logic/validError";
import { getCache as statusMgmtGetCache } from "../../../logic/status";
import getChnlPerm from "../../../logic/chnlPermissionCache";
import { clearEventCache } from "../../../logic/sendMessageUtils/announcementChnl";
import db from "../../../dataBase";
import Db_RealmConf from "../../../types/db/realmConf";
import Db_UserData from "../../../types/db/userData";
import Db_RealmData from "../../../types/db/realmData";
import { Socket_StandardRes } from "../../../types/socket/res";
import { Socket_User } from "../../../types/socket/user";
import { Id } from "../../../types/base";
import Socket__Realms from "../../../types/socket/chat/realms";
import eventCreateData from "../valid/event";
import Db_System from "../../../types/db/system";
import { addTask, cancelTask } from "../../../schedule";
import InternalCode from "../../../codes";
import { checkIsUserInRealm } from "../../../logic/checkIsUserInRealm";

const eventCreateSchemat = valid.objAjv(eventCreateData);

export async function realm_setup(suser: Socket_User, id: Id): Promise<Socket_StandardRes> {
    const validE = new ValidError("realm.setup");
    if (!valid.id(id)) return validE.valid("id");

    const isUserInRealm = await checkIsUserInRealm(suser._id, id);
    if (!isUserInRealm) return validE.err(InternalCode.UserError.Socket.UserNotOnRealm);

    const realmMeta = await db.realmConf.findOne<Db_RealmConf.set>(id, { _id: "set" });
    if (!realmMeta) return validE.err(InternalCode.UserError.Socket.RealmSetup_RealmNotFound);

    const name = realmMeta.name;
    const permSys = new permissionSystem(id);

    const buildChannels = [];
    const categories = await db.realmConf.find<Db_RealmConf.category>(id, { $exists: { cid: true } });
    const channels = await db.realmConf.find<Db_RealmConf.channel>(id, { $exists: { chid: true } });
    const sortedCategories = categories.sort((a, b) => a.i - b.i);

    for (let i = 0; i < sortedCategories.length; i++) {
        const category = sortedCategories[i];
        let chnls = channels.filter(c => c.category == category.cid);
        chnls = chnls.sort((a, b) => a.i - b.i);
        // @ts-ignore
        // TODO fix type
        chnls = await Promise.all(chnls.map(async c => {
            const perms = await getChnlPerm(suser._id, id, c.chid);
            if (!perms) return null;

            if (!perms.view) return null;

            return {
                id: c.chid,
                name: c.name,
                type: c.type,
                perms,
                desc: c.desc,
            }
        }))
        chnls = chnls.filter(c => !!c);

        if (chnls.length == 0) continue;
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

export async function realm_users_sync(suser: Socket_User, id: Id): Promise<Socket_StandardRes> {
    const validE = new ValidError("realm.users.sync");
    if (!valid.id(id)) return validE.valid("id");

    const isUserInRealm = await checkIsUserInRealm(suser._id, id);
    if (!isUserInRealm) return validE.err(InternalCode.UserError.Socket.UserNotOnRealm);

    const permSys = new permissionSystem(id);
    const roles = await permSys.getAllRolesSorted();
    const rolesData = roles.map(({ name, c }) => { return { name, c } });

    const rolesMap = new Map();
    for (const role of roles) rolesMap.set(role.rid, role.name);

    const users = await db.realmUser.find(id, {});
    const usersData = users.map(u => {
        const uid = u.u || u.bot;
        let symbolUID = uid;
        if (u.bot) symbolUID = "^" + u.bot;

        return {
            uid: symbolUID,
            roles: u.r.map(r => rolesMap.get(r)),
        }
    });

    return { err: false, res: [usersData, rolesData] };
}

export async function realm_users_activity_sync(suser: Socket_User, id: Id): Promise<Socket_StandardRes> {
    const validE = new ValidError("realm.users.activity.sync");
    if (!valid.id(id)) return validE.valid("id");

    const isUserInRealm = await checkIsUserInRealm(suser._id, id);
    if (!isUserInRealm) return validE.err(InternalCode.UserError.Socket.UserNotOnRealm);

    const users = await db.realmUser.find(id, {});
    const usersData = users.map(async u => {
        const uid = u.u || u.bot;
        let symbolUID = uid;
        if (u.bot) symbolUID = "^" + u.bot;

        let userOnline = false;
        if (u.u) userOnline = global.getSocket(uid).length > 0;
        if (u.bot) userOnline = global.getSocket(uid, "bot").length > 0;
        if (!userOnline) return { uid: symbolUID };

        const st = await db.userData.findOne<Db_UserData.status>(uid, { _id: "status" });
        const status = st?.text || "online";

        return {
            uid: symbolUID,
            activity: statusMgmtGetCache(uid),
            status,
        }
    });

    const res = await Promise.all(usersData);

    return { err: false, res: [res] };
}

export async function realm_delete(suser: Socket_User, id: Id, name: string): Promise<Socket_StandardRes> {
    const validE = new ValidError("realm.delete");
    if (!valid.id(id)) return validE.valid("id");
    if (!valid.str(name, 0, 30)) return validE.valid("name");

    const realmMeta = await db.realmConf.findOne<Db_RealmConf.set>(id, { _id: "set" });
    if (realmMeta.name != name) return validE.valid("name");

    const permSys = new permissionSystem(id);
    const userPerm = await permSys.canUserPerformAction(suser._id, Permissions.admin);
    if (!userPerm) return validE.err(InternalCode.UserError.Socket.RealmEdit_NotAuthorized);

    const users = await db.realmUser.find(id, {}).then(users => users.map(u => u.u));
    for (const user of users) await db.userData.removeOne(user, { realm: id });

    db.realmConf.removeCollection(id);
    db.realmUser.removeCollection(id);
    db.mess.removeCollection(id);
    db.realmData.removeCollection(id);

    for (const user of users) global.sendToSocket(user, "refreshData", "realm.get");

    return { err: false };
}

export async function realm_user_kick(suser: Socket_User, realmId: Id, uid: Id, ban: boolean = false): Promise<Socket_StandardRes> {
    const validE = new ValidError("realm.user.kick");
    if (!valid.id(realmId)) return validE.valid("realmId");
    if (!valid.id(uid)) return validE.valid("uid");
    if (!valid.bool(ban)) return validE.valid("ban");

    const permSys = new permissionSystem(realmId);
    const userPerm = await permSys.canUserPerformAnyAction(suser._id, [
        Permissions.admin,
        Permissions.banUser,
        Permissions.kickUser
    ]);
    if (!userPerm) return validE.err(InternalCode.UserError.Socket.RealmEdit_NotAuthorized);

    await db.userData.removeOne(uid, { realm: realmId });
    await db.realmUser.removeOne(realmId, { uid });

    if (ban) {
        await db.realmUser.add(realmId, { ban: uid }, false);
    }

    global.sendToSocket(uid, "refreshData", "realm.get");

    return { err: false };
}

export async function realm_user_unban(suser: Socket_User, realmId: Id, uid: Id): Promise<Socket_StandardRes> {
    const validE = new ValidError("realm.user.unban");
    if (!valid.id(realmId)) return validE.valid("realmId");
    if (!valid.id(uid)) return validE.valid("uid");

    const perm = new permissionSystem(realmId);
    const userPerm = await perm.canUserPerformAnyAction(suser._id, [
        Permissions.admin,
        Permissions.banUser
    ]);
    if (!userPerm) return validE.err(InternalCode.UserError.Socket.RealmEdit_NotAuthorized);

    await db.realmUser.removeOne(realmId, { ban: uid });
    return { err: false };
}

export async function realm_emojis_sync(suser: Socket_User, realmId: Id): Promise<Socket_StandardRes> {
    const validE = new ValidError("realm.emojis.sync");
    if (!valid.id(realmId)) return validE.valid("realmId");

    const isUserInRealm = await checkIsUserInRealm(suser._id, realmId);
    if (!isUserInRealm) return validE.err(InternalCode.UserError.Socket.UserNotOnRealm);

    const emojis = await db.realmConf.find(realmId, { $exists: { unicode: true } });
    return { err: false, res: [emojis] };
}

export async function realm_announcement_channel_subscribe(
    suser: Socket_User,
    sourceRealmId: Id,
    sourceChannelId: Id,
    targetRealmId: Id,
    targetChannelId: Id
): Promise<Socket_StandardRes> {
    const validE = new ValidError("realm.announcement.channel.subscribe");
    if (!valid.id(sourceRealmId)) return validE.valid("sourceRealmId");
    if (!valid.id(sourceChannelId)) return validE.valid("sourceChannelId");
    if (!valid.id(targetRealmId)) return validE.valid("targetRealmId");
    if (!valid.id(targetChannelId)) return validE.valid("targetChannelId");

    const permSys = new permissionSystem(targetRealmId);
    const userPerm = await permSys.canUserPerformAction(suser._id, Permissions.admin);
    if (!userPerm) return validE.err(InternalCode.UserError.Socket.RealmEdit_NotAuthorized);

    const data = {
        sr: sourceRealmId,
        sc: sourceChannelId,
        tr: targetRealmId,
        tc: targetChannelId
    }

    const exists = await db.realmData.findOne("events.channels", data);
    if (exists) return validE.err(InternalCode.UserError.Socket.RealmAnnouncementSubscribe_AlreadySubscribed);

    await db.realmData.add("events.channels", data, false);
    clearEventCache(targetRealmId);

    return { err: false };
}

export async function realm_announcement_channel_unsubscribe(
    suser: Socket_User,
    sourceRealmId: Id,
    sourceChannelId: Id,
    targetRealmId: Id,
    targetChannelId: Id
): Promise<Socket_StandardRes> {
    const validE = new ValidError("realm.announcement.channel.unsubscribe");
    if (!valid.id(sourceRealmId)) return validE.valid("sourceRealmId");
    if (!valid.id(sourceChannelId)) return validE.valid("sourceChannelId");
    if (!valid.id(targetRealmId)) return validE.valid("targetRealmId");
    if (!valid.id(targetChannelId)) return validE.valid("targetChannelId");

    const permSys = new permissionSystem(targetRealmId);
    const userPerm = await permSys.canUserPerformAction(suser._id, Permissions.admin);
    if (!userPerm) return validE.err(InternalCode.UserError.Socket.RealmEdit_NotAuthorized);

    await db.realmData.removeOne("events.channels", {
        sr: sourceRealmId,
        sc: sourceChannelId,
        tr: targetRealmId,
        tc: targetChannelId
    });

    clearEventCache(targetRealmId);

    return { err: false };
}

export async function realm_announcement_channel_available(suser: Socket_User): Promise<Socket_StandardRes> {
    const userRealms = await db.userData.find<Db_UserData.realm>(suser._id, { $exists: { realm: true } });
    const realmsWithAdmin = [];
    for (const userRealmId of userRealms) {
        const permSys = new permissionSystem(userRealmId.realm);
        const userPerm = await permSys.canUserPerformAction(suser._id, Permissions.admin);
        if (userPerm) realmsWithAdmin.push(userRealmId.realm);
    }

    return { err: false, res: [realmsWithAdmin] };
}

export async function realm_announcement_channel_list(suser: Socket_User, realmId: Id): Promise<Socket_StandardRes> {
    const validE = new ValidError("realm.announcement.channel.list");
    if (!valid.id(realmId)) return validE.valid("realmId");

    const isUserInRealm = await checkIsUserInRealm(suser._id, realmId);
    if (!isUserInRealm) return validE.err(InternalCode.UserError.Socket.UserNotOnRealm);

    const permSys = new permissionSystem(realmId);
    const userPerm = await permSys.canUserPerformAction(suser._id, Permissions.admin);
    if (!userPerm) return validE.err(InternalCode.UserError.Socket.RealmEdit_NotAuthorized);

    const subscribedChannels = await db.realmData.find<Db_RealmData.events_channels>("events.channels", { tr: realmId });
    const channels = await db.realmConf.find<Pick<Db_RealmConf.channel, "chid" | "name">>(
        realmId,
        {
            $exists: {
                chid: true
            },
            $in: {
                type: ["text", "announcement", "open_announcement"]
            }
        },
        {},
        {},
        {
            select: ["chid", "name"]
        }
    ).then(channels => {
        const availableChannels = [];
        for (const channel of channels) {
            if (subscribedChannels.some(tc => tc.sc == channel.chid)) continue; // no subscription to self
            if (subscribedChannels.some(tc => tc.tc == channel.chid)) continue; // already subscribed
            availableChannels.push(channel);
        }
        return availableChannels;
    });
    return { err: false, res: [channels] };
}

export async function realm_thread_create(
    suser: Socket_User,
    realmId: Id,
    channelId: Id,
    name: string,
    replyMsgId: Id = null
): Promise<Socket_StandardRes> {
    const validE = new ValidError("realm.thread.create");
    if (!valid.id(realmId)) return validE.valid("realmId");
    if (!valid.id(channelId)) return validE.valid("channelId");
    if (!valid.str(name, 0, 30)) return validE.valid("name");
    if (replyMsgId && !valid.id(replyMsgId)) return validE.valid("replyMsgId");

    const chnlType = await db.realmConf.findOne<Db_RealmConf.channel>(realmId, { chid: channelId });
    if (!chnlType) return validE.valid("channelId");

    if (chnlType.type != "forum") {
        const perms = await getChnlPerm(suser._id, realmId, channelId);
        if (!perms.threadCreate) return validE.err(InternalCode.UserError.Socket.RealmEdit_NotAuthorized);
    }

    const threadObj: Db_RealmData.thread = {
        thread: channelId,
        name,
        author: suser._id,
    }
    if (replyMsgId) threadObj.reply = replyMsgId;

    const thread = await db.realmData.add<Db_RealmData.thread>(realmId, threadObj, true);

    return { err: false, res: [thread._id] };
}

export async function realm_thread_delete(suser: Socket_User, realmId: Id, threadId: Id): Promise<Socket_StandardRes> {
    const validE = new ValidError("realm.thread.delete");
    if (!valid.id(realmId)) return validE.valid("realmId");
    if (!valid.id(threadId)) return validE.valid("threadId");

    const perms = await getChnlPerm(suser._id, realmId, threadId);
    if (!perms.threadCreate) return validE.err(InternalCode.UserError.Socket.RealmEdit_NotAuthorized);

    const thread = await db.realmData.findOne<Db_RealmData.thread>(realmId, { _id: threadId });
    if (!thread) return validE.err(InternalCode.UserError.Socket.ThreadDelete_NotFound);

    if (thread.author != suser._id) {
        const permSys = new permissionSystem(realmId);
        const canAdmin = await permSys.canUserPerformAction(suser._id, Permissions.admin);
        if (!canAdmin) return validE.err(InternalCode.UserError.Socket.RealmEdit_NotAuthorized); // if admin, can delete any thread
    }

    await db.realmData.removeOne(realmId, { _id: threadId });
    await db.mess.remove(realmId, { chnl: "&" + threadId });
    global.sendToChatUsers(realmId, "realm.thread.delete", threadId);

    return { err: false };
}

export async function realm_thread_list(suser: Socket_User, realmId: Id | null, channelId: Id): Promise<Socket_StandardRes> {
    const validE = new ValidError("realm.thread.list");
    if (!valid.id(realmId)) return validE.valid("realmId");
    if (!valid.id(channelId) && channelId != null) return validE.valid("channelId");

    const isUserInRealm = await checkIsUserInRealm(suser._id, realmId);
    if (!isUserInRealm) return validE.err(InternalCode.UserError.Socket.UserNotOnRealm);

    if (channelId === null) {
        const threads = await db.realmData.find(realmId, { $exists: { thread: true } });
        const chnlCache: Record<Id, Db_RealmConf.channel["type"]> = {};
        const cpu_threads = threads.map(async t => {
            async function getChnlType() {
                if (t.thread in chnlCache) return chnlCache[t.thread] as Db_RealmConf.channel["type"];
                const chnl = await db.realmConf.findOne<Db_RealmConf.channel>(realmId, { chid: t.thread });
                chnlCache[t.thread] = chnl.type;
                return chnl.type;
            }

            const type = await getChnlType();
            if (type === "forum") return false;
            const perms = await getChnlPerm(suser._id, realmId, t.thread);
            return perms.threadView ? t : false;
        });
        const threadsWithPerms = await Promise.all(cpu_threads);
        const filtered = threadsWithPerms.filter(Boolean);
        return { err: false, res: [filtered] };
    }

    const perms = await getChnlPerm(suser._id, realmId, channelId);
    if (!perms.threadView) return validE.err(InternalCode.UserError.Socket.RealmThreadList_NotAuthorized);

    const threads = await db.realmData.find(realmId, { thread: channelId });
    return { err: false, res: [threads] };
}

export async function realm_event_create(suser: Socket_User, realmId: Id, req: Socket__Realms.Event__req): Promise<Socket_StandardRes> {
    const validE = new ValidError("realm.event.create");
    if (!valid.id(realmId)) return validE.valid("realmId");

    if (!eventCreateSchemat(req)) return validE.valid("req");
    if (req.type === "voice") {
        if (!valid.id(req.where)) return validE.valid("req.where");
        const chnl = await db.realmConf.findOne<Db_RealmConf.channel>(realmId, { chid: req.where });
        if (!chnl) return validE.valid("req.where");
        if (chnl.type !== "voice") return validE.valid("req.where");
    }

    const actualTime = Date.now();
    // check if time is in the future or 1 minute in the past
    if (req.time * 1000 <= actualTime + 60_000) return validE.valid("req.time");

    const permSys = new permissionSystem(realmId);
    const canAdmin = await permSys.canUserPerformAction(suser._id, Permissions.admin);
    if (!canAdmin) return validE.err(InternalCode.UserError.Socket.RealmEdit_NotAuthorized);

    const data: Omit<Db_RealmData.event, "_id"> = {
        evt: true,
        type: req.type,
        where: req.where,
        time: req.time,
        author: suser._id,
        topic: req.topic,
    }
    if (req.desc) data.desc = req.desc;
    if (req.img) data.img = req.img;

    const { _id } = await db.realmData.add(realmId, data) as Db_RealmData.event;

    const task: Omit<Db_System.task, "_id"> = {
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

export async function realm_event_delete(suser: Socket_User, realmId: Id, eventId: Id): Promise<Socket_StandardRes> {
    const validE = new ValidError("realm.event.delete");
    if (!valid.id(realmId)) return validE.valid("realmId");
    if (!valid.id(eventId)) return validE.valid("eventId");

    const permSys = new permissionSystem(realmId);
    const canAdmin = await permSys.canUserPerformAction(suser._id, Permissions.admin);
    if (!canAdmin) return validE.err(InternalCode.UserError.Socket.RealmEdit_NotAuthorized);

    const taskId = await db.system.findOne<Db_System.task>("tasks", { type: "event", data: { evt: eventId } });
    if (taskId) await cancelTask(taskId._id);
    await db.realmData.removeOne(realmId, { _id: eventId, evt: true });
    await db.realmData.remove(realmId, { uevt: eventId });

    return { err: false };
}

export async function realm_event_list(suser: Socket_User, realmId: Id, len: boolean = false): Promise<Socket_StandardRes> {
    const validE = new ValidError("realm.event.list");
    if (!valid.id(realmId)) return validE.valid("realmId");

    const isUserInRealm = await checkIsUserInRealm(suser._id, realmId);
    if (!isUserInRealm) return validE.err(InternalCode.UserError.Socket.UserNotOnRealm);

    const events = await db.realmData.find<Db_RealmData.event>(realmId, { evt: true });
    if (len) return { err: false, res: [events.length] };

    const eventsUsers = await db.realmData.find<Db_RealmData.event_user>(realmId, { $exists: { uevt: true } });
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

export async function realm_event_join(suser: Socket_User, realmId: Id, eventId: Id): Promise<Socket_StandardRes> {
    const validE = new ValidError("realm.event.join");
    if (!valid.id(realmId)) return validE.valid("realmId");
    if (!valid.id(eventId)) return validE.valid("eventId");

    const isUserInRealm = await checkIsUserInRealm(suser._id, realmId);
    if (!isUserInRealm) return validE.err(InternalCode.UserError.Socket.UserNotOnRealm);

    const joined = await db.realmData.findOne<Db_RealmData.event_user>(realmId, { u: suser._id, uevt: eventId });
    if (joined) return validE.err(InternalCode.UserError.Socket.RealmEventJoin_AlreadyJoined);

    await db.realmData.add(realmId, { u: suser._id, uevt: eventId });

    return { err: false };
}

export async function realm_event_leave(suser: Socket_User, realmId: Id, eventId: Id): Promise<Socket_StandardRes> {
    const validE = new ValidError("realm.event.leave");
    if (!valid.id(realmId)) return validE.valid("realmId");
    if (!valid.id(eventId)) return validE.valid("eventId");

    const isUserInRealm = await checkIsUserInRealm(suser._id, realmId);
    if (!isUserInRealm) return validE.err(InternalCode.UserError.Socket.UserNotOnRealm);

    await db.realmData.removeOne(realmId, { u: suser._id, uevt: eventId });

    return { err: false };
}

export async function realm_event_get_topic(suser: Socket_User, realmId: Id, eventId: Id): Promise<Socket_StandardRes> {
    const validE = new ValidError("realm.event.get.topic");
    if (!valid.id(realmId)) return validE.valid("realmId");
    if (!valid.id(eventId)) return validE.valid("eventId");

    const isUserInRealm = await checkIsUserInRealm(suser._id, realmId);
    if (!isUserInRealm) return validE.err(InternalCode.UserError.Socket.UserNotOnRealm);

    const event = await db.realmData.findOne<Db_RealmData.event>(realmId, { _id: eventId, evt: true });
    if (!event) return validE.err(InternalCode.UserError.Socket.RealmEventGetTopic_NotFound);

    return { err: false, res: [event.topic] };
}