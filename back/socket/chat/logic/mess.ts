import { combineId } from "../../../logic/chatMgmt";
import valid, { validChannelId } from "../../../logic/validData";
import permissionSystem from "../../../logic/permission-system/index";
import Permissions from "../../../logic/permission-system/permBD";
import { extractTimeFromId } from "../../../logic/utils";
import messageSearchData from "../valid/messageSearch";
import ValidError from "../../../logic/validError";
import { realm_thread_delete } from "./realms";
import getChnlPerm from "../../../logic/chnlPermissionCache";
import db from "../../../dataBase";
import Db_Mess from "../../../types/db/mess";
import Db_RealmData from "../../../types/db/realmData";
import Socket__Mess from "../../../types/socket/chat/mess";
import { Socket_User } from "../../../types/socket/user";
import { Id } from "../../../types/base";
import { Socket_StandardRes } from "../../../types/socket/res";
import InternalCode from "../../../codes";

const messageSearchSchemat = valid.objAjv(messageSearchData);

export async function message_edit(
    suser: Socket_User,
    chatId: Id,
    _id: Id,
    msg: string,
    options: Socket__Mess.message_edit__opts = {}
): Promise<Socket_StandardRes> {
    options = {
        minMsg: 0,
        maxMsg: 2000,
        ...options,
    }
    const validE = new ValidError("message.edit");
    if (!valid.id(chatId)) return validE.valid("chatId");
    if (!valid.id(_id)) return validE.valid("_id");
    if (!valid.str(msg, options.minMsg, options.maxMsg)) return validE.valid("msg");


    const isDmChat = chatId.startsWith("$");
    const dbChatId = isDmChat ? combineId(suser._id, chatId.replace("$", "")) : chatId;

    const mess = await db.mess.findOne<Db_Mess.Message>(dbChatId, { _id });
    if (!mess) {
        return validE.err(InternalCode.UserError.Socket.MessageEdit_MessageNotFound);
    }
    if (mess.fr !== suser._id) {
        return validE.err(InternalCode.UserError.Socket.MessageEdit_NotAuthorized);
    }

    const time = Math.floor(new Date().getTime() / 1000).toString(36);
    await db.mess.updateOne(dbChatId, { _id }, { msg, lastEdit: time });

    if (isDmChat) {
        global.sendToSocket(suser._id, "message.edit", _id, msg, time);
        global.sendToSocket(chatId.replace("$", ""), "message.edit", _id, msg, time);
    } else {
        global.sendToChatUsers(dbChatId, "message.edit", _id, msg, time);
    }

    return { err: false };
}

export async function message_delete(suser: Socket_User, chatId: Id, _id: Id): Promise<Socket_StandardRes> {
    const validE = new ValidError("message.delete");
    if (!valid.id(chatId)) return validE.valid("chatId");
    if (!valid.id(_id)) return validE.valid("_id");

    const isDmChat = chatId.startsWith("$");
    const dbChatId = isDmChat ? combineId(suser._id, chatId.replace("$", "")) : chatId;

    const mess = await db.mess.findOne<Db_Mess.Message>(dbChatId, { _id });
    if (!mess) {
        return validE.err(InternalCode.UserError.Socket.MessageDelete_MessageNotFound);
    }
    if (mess.fr !== suser._id) {
        const permSys = new permissionSystem(dbChatId);
        const userPerm = await permSys.canUserPerformAction(suser._id, Permissions.manageMessages);
        if (!userPerm)
            return validE.err(InternalCode.UserError.Socket.MessageDelete_NotAuthorized);
    }

    await db.mess.removeOne(dbChatId, { _id });
    if (isDmChat) {
        global.sendToSocket(suser._id, "message.delete", _id);
        global.sendToSocket(chatId.replace("$", ""), "message.delete", _id);
    } else {
        global.sendToChatUsers(dbChatId, "message.delete", _id);
        const threads = await db.realmData.find<Db_RealmData.thread>(dbChatId, { reply: _id });
        for (const thread of threads) {
            await realm_thread_delete(suser, dbChatId, thread._id);
        }
    }

    return { err: false };
}

export async function messages_delete(suser: Socket_User, chatId: Id, ids: Id[]): Promise<Socket_StandardRes> {
    const validE = new ValidError("messages.delete");
    if (!valid.id(chatId)) return validE.valid("chatId");
    if (!valid.arrayId(ids)) return validE.valid("ids");

    const isDmChat = chatId.startsWith("$");
    const dbChatId = isDmChat ? combineId(suser._id, chatId.replace("$", "")) : chatId;

    const messages = await db.mess.find<Db_Mess.Message>(dbChatId, { $in: { _id: ids } });
    if (messages.some(mess => mess.fr !== suser._id)) {
        if (isDmChat) return validE.err(InternalCode.UserError.Socket.MessagesDelete_NotAuthorized);
        const permSys = new permissionSystem(dbChatId);
        const userPerm = await permSys.canUserPerformAction(suser._id, Permissions.manageMessages);
        if (!userPerm)
            return validE.err(InternalCode.UserError.Socket.MessagesDelete_NotAuthorized);
    }

    if (!isDmChat) {
        for (const mess of messages) {
            const threads = await db.realmData.find<Db_RealmData.thread>(dbChatId, { reply: mess._id });
            for (const thread of threads) {
                await realm_thread_delete(suser, chatId, thread._id);
            }
        }
    }
    await db.mess.remove(dbChatId, { $in: { _id: ids } });
    if (isDmChat) {
        global.sendToSocket(suser._id, "messages.delete", ids);
        global.sendToSocket(chatId.replace("$", ""), "messages.delete", ids);
    } else {
        global.sendToChatUsers(dbChatId, "messages.delete", ids);
    }

    return { err: false };
}

export async function message_fetch(
    suser: Socket_User,
    chatId: Id,
    chnl: Id,
    start: number,
    end: number
): Promise<Socket_StandardRes> {
    const validE = new ValidError("message.fetch");
    if (!valid.id(chatId)) return validE.valid("chatId");
    if (!validChannelId(chnl)) return validE.valid("chnl");
    if (!valid.num(start, 0)) return validE.valid("start");
    if (!valid.num(end, 0)) return validE.valid("end");

    const isDmChat = chatId.startsWith("$");
    const dbChatId = isDmChat ? combineId(suser._id, chatId.replace("$", "")) : chatId;

    if (!isDmChat) {
        const perm = await getChnlPerm(suser._id, dbChatId, chnl);
        if (!perm.view) return validE.err(InternalCode.UserError.Socket.MessageFetch_ChannelNotFound);
    }

    const responeAll = await db.mess.find(dbChatId, { chnl }, {}, { reverse: true, max: end + start });
    const res = responeAll.slice(start, end);

    return { err: false, res: [res] };
}

export async function message_fetch_id(suser: Socket_User, chatId: Id, chnl: Id, mess_id: Id): Promise<Socket_StandardRes> {
    const validE = new ValidError("message.fetch.id");
    if (!valid.id(chatId)) return validE.valid("chatId");
    if (!valid.id(mess_id)) return validE.valid("mess_id");
    if (!validChannelId(chnl)) return validE.valid("chnl");

    const isDmChat = chatId.startsWith("$");
    const dbChatId = isDmChat ? combineId(suser._id, chatId.replace("$", "")) : chatId;

    if (!isDmChat) {
        const perm = await getChnlPerm(suser._id, dbChatId, chnl);
        if (!perm.view) return validE.err(InternalCode.UserError.Socket.MessageFetchId_ChannelNotFound);
    }

    const res = await db.mess.findOne(dbChatId, { _id: mess_id });
    return { err: false, res: [res] };
}

export async function message_mark_read(suser: Socket_User, chatId: Id, chnl: Id, mess_id: Id): Promise<Socket_StandardRes> {
    const validE = new ValidError("message.mark.read");
    if (!valid.id(chatId)) return validE.valid("to");
    if (!validChannelId(chnl)) return validE.valid("chnl");
    if (!valid.idOrSpecificStr(mess_id, ["last"])) return validE.valid("mess_id");

    const isDmChat = chatId.startsWith("$");

    const search: { priv?: Id; realm?: Id } = {};
    if (isDmChat) search.priv = chatId.replace("$", "");
    else search.realm = chatId;

    let res: Id = undefined;

    if (mess_id == "last") {
        const dbChatId = isDmChat ? combineId(suser._id, chatId.replace("$", "")) : chatId;
        const lastIdMess = await db.mess.find<Db_Mess.Message>(dbChatId, { chnl }, {}, { reverse: true, max: 1 });
        if (lastIdMess.length == 0) return { err: false, res: [0] };
        mess_id = lastIdMess[0]._id;
        res = mess_id;
    }

    await db.userData.updateOne(suser._id, search, {
        $merge: {
            last: {
                [chnl]: mess_id
            }
        }
    })

    return { err: false, res: [res] };
}

export async function message_react(suser: Socket_User, chatId: Id, msgId: Id, react: string): Promise<Socket_StandardRes> {
    const validE = new ValidError("message.react");
    if (!valid.id(chatId)) return validE.valid("chatId");
    if (!valid.id(msgId)) return validE.valid("msgId");
    if (!valid.str(react, 0, 30)) return validE.valid("react");


    const isDmChat = chatId.startsWith("$");
    const dbChatId = isDmChat ? combineId(suser._id, chatId.replace("$", "")) : chatId;

    const msg = await db.mess.findOne<Db_Mess.Message>(dbChatId, { _id: msgId });
    if (!msg) return validE.err(InternalCode.UserError.Socket.MessageReact_MessageNotFound);

    const chnl = msg.chnl;
    const perm = await getChnlPerm(suser._id, dbChatId, chnl);
    if (!perm.react) return validE.err(InternalCode.UserError.Socket.MessageReact_NotAuthorized);

    const reacts = msg.reacts || {};
    if (!reacts[react]) reacts[react] = [];

    if (reacts[react].includes(suser._id)) {
        reacts[react] = reacts[react].filter(id => id != suser._id);
        if (reacts[react].length == 0) delete reacts[react];
    } else {
        reacts[react].push(suser._id);
    }

    await db.mess.updateOne(dbChatId, { _id: msgId }, { reacts });

    if (chatId.startsWith("$")) {
        global.sendToSocket(suser._id, "message.react", suser._id, chatId, msgId, react);
        global.sendToSocket(chatId.replace("$", ""), "message.react", suser._id, "$" + suser._id, msgId, react);
    } else {
        global.sendToChatUsers(chatId, "message.react", suser._id, chatId, msgId, react);
    }

    return { err: false };
}

export async function message_search(suser: Socket_User, chatId: Id, chnl: Id, query: Socket__Mess.MessageQuery): Promise<Socket_StandardRes> {
    const validE = new ValidError("message.search");
    if (!valid.id(chatId)) return validE.valid("realm");
    if (!validChannelId(chnl)) return validE.valid("chnl");
    if (!messageSearchSchemat(query)) return validE.valid("search", messageSearchSchemat.errors);

    const isDmChat = chatId.startsWith("$");
    const dbChatId = isDmChat ? combineId(suser._id, chatId.replace("$", "")) : chatId;

    const res = await db.mess.find(dbChatId, (data, context) => {
        if (data.chnl != chnl) return false;
        return context.filterMessages(context.query, data);
    }, { query, filterMessages });

    return { err: false, res: [res] };
}

export async function message_pin(suser: Socket_User, chatId: Id, chnl: Id, msg_id: Id, pin: boolean): Promise<Socket_StandardRes> {
    const validE = new ValidError("message.pin");
    if (!valid.id(chatId)) return validE.valid("realm");
    if (!validChannelId(chnl)) return validE.valid("chnl");
    if (!valid.id(msg_id)) return validE.valid("msgId");
    if (!valid.bool(pin)) return validE.valid("pin");

    const isDmChat = chatId.startsWith("$");
    const dbChatId = isDmChat ? combineId(suser._id, chatId.replace("$", "")) : chatId;

    await db.mess.updateOne(dbChatId, { _id: msg_id }, { pinned: pin });
    const refreshData = {
        evt: "message.fetch.pinned",
        realm: chatId,
        chnl,
    }

    if (isDmChat) {
        global.sendToSocket(suser._id, "refreshData", refreshData, chatId, chnl);
        refreshData.realm = "$" + suser._id;
        global.sendToSocket(chatId.replace("$", ""), "refreshData", refreshData, "$" + suser._id, chnl);
    } else {
        global.sendToChatUsers(chatId, "refreshData", refreshData, chatId, chnl);
    }

    return { err: false };
}

export async function message_fetch_pinned(suser: Socket_User, chatId: Id, chnl: Id): Promise<Socket_StandardRes> {
    const validE = new ValidError("message.get.pinned");
    if (!valid.id(chatId)) return validE.valid("realm");
    if (!validChannelId(chnl)) return validE.valid("chnl");

    const isDmChat = chatId.startsWith("$");
    const dbChatId = isDmChat ? combineId(suser._id, chatId.replace("$", "")) : chatId;

    const res = await db.mess.find(dbChatId, { chnl, pinned: true });

    return { err: false, res: [res] };
}

function filterMessages(query: Socket__Mess.MessageQuery, mess: Db_Mess.Message): boolean {
    const time = extractTimeFromId(mess._id) * 1000;

    if (query.from && mess.fr !== query.from) return false;
    if (query.mentions && !mess.msg.includes(`@${query.mentions}`)) return false;

    if (query.before && time >= new Date(query.before).getTime()) return false;
    if (query.during) {
        const startOfDay = new Date(query.during).setHours(0, 0, 0, 0);
        const endOfDay = new Date(query.during).setHours(23, 59, 59, 999);
        if (time < startOfDay || time > endOfDay) return false;
    }
    if (query.after && time <= new Date(query.after).getTime()) return false;
    if (query.pinned !== undefined && query.pinned !== (mess.pinned === true)) return false;
    if (query.message && !mess.msg.includes(query.message)) return false;

    return true;
}
