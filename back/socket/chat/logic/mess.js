import { combineId } from "../../../logic/chatMgmt.js";
import valid, { validChannelId } from "../../../logic/validData.js";
import permissionSystem from "../../../logic/permission-system/index.js";
import Permissions from "../../../logic/permission-system/permBD.js";
import { extractTimeFromId } from "../../../logic/utils.js";
import messageSearchData from "../valid/messageSearch.js";
import ValidError from "../../../logic/validError.js";
import { realm_thread_delete } from "./realms.js";
import getChnlPerm from "../../../logic/chnlPermissionCache.js";
import db from "../../../dataBase.js";

const messageSearchSchemat = valid.objAjv(messageSearchData);

export async function message_edit(suser, toM, _id, msg, options={}){
    options = {
        minMsg: 0,
        maxMsg: 2000,
        ...options,
    }
    const validE = new ValidError("message.edit");
    if(!valid.id(toM)) return validE.valid("toM");
    if(!valid.id(_id)) return validE.valid("_id");
    if(!valid.str(msg, options.minMsg, options.maxMsg)) return validE.valid("msg");

    const privChat = toM.startsWith("$");
    let to = toM;
    if(privChat){
        const p1 = suser._id;
        const p2 = to.replace("$", "");
        to = combineId(p1, p2);
    }

    const mess = await db.mess.findOne(to, { _id });
    if(!mess){
        return validE.err("message does not exist");
    }
    if(mess.fr !== suser._id){
        return validE.err("not authorized");
    }

    const time = global.getTime();
    await db.mess.updateOne(to, { _id }, { msg, lastEdit: time });

    if(privChat){
        sendToSocket(suser._id,       "message.edit", _id, msg, time);
        sendToSocket(toM.replace("$", ""),  "message.edit", _id, msg, time);
    }else{
        sendToChatUsers(toM, "message.edit", _id, msg, time);
    }

    return { err: false };
}

export async function message_delete(suser, toM, _id){
    const validE = new ValidError("message.delete");
    if(!valid.id(toM)) return validE.valid("toM");
    if(!valid.id(_id)) return validE.valid("_id");

    const privChat = toM.startsWith("$");
    let to = toM;
    if(privChat){
        const p1 = suser._id;
        const p2 = to.replace("$", "");
        to = combineId(p1, p2);
    }

    const mess = await db.mess.findOne(to, { _id });
    if(!mess){
        return validE.err("message does not exist");
    }
    if(mess.fr !== suser._id){
        const permSys = new permissionSystem(to);
        const userPerm = await permSys.canUserPerformAction(suser._id, Permissions.manageMessages);
        if(!userPerm)
            return validE.err("not authorized");
    }

    await db.mess.removeOne(to, { _id });
    if(privChat){
        sendToSocket(suser._id,             "message.delete", _id);
        sendToSocket(toM.replace("$", ""),  "message.delete", _id);
    }else{
        sendToChatUsers(toM, "message.delete", _id);
        const threads = await db.realmData.find(to, { reply: _id });
        for(const thread of threads){
            await realm_thread_delete(suser, toM, thread._id);
        }
    }

    return { err: false };
}

export async function messages_delete(suser, toM, ids){
    const validE = new ValidError("messages.delete");
    if(!valid.id(toM)) return validE.valid("toM");
    if(!valid.arrayId(ids)) return validE.valid("ids");

    const privChat = toM.startsWith("$");
    let to = toM;
    if(privChat){
        const p1 = suser._id;
        const p2 = to.replace("$", "");
        to = combineId(p1, p2);
    }

    const messages = await db.mess.find(to, { $in: { _id: ids } });
    if(messages.some(mess => mess.fr !== suser._id)){
        if(privChat) return validE.err("not authorized");
        const permSys = new permissionSystem(to);
        const userPerm = await permSys.canUserPerformAction(suser._id, Permissions.manageMessages);
        if(!userPerm)
            return validE.err("not authorized");
    }

    if(!privChat){
        for(const mess of messages){
            const threads = await db.realmData.find(to, { reply: mess._id });
            for(const thread of threads){
                await realm_thread_delete(suser, toM, thread._id);
            }
        }
    }
    await db.mess.remove(to, { $in: { _id: ids } });
    if(privChat){
        sendToSocket(suser._id,             "messages.delete", ids);
        sendToSocket(toM.replace("$", ""),  "messages.delete", ids);
    }else{
        sendToChatUsers(toM, "messages.delete", ids);
    }

    return { err: false };
}

export async function message_fetch(suser, to, chnl, start, end){
    const validE = new ValidError("message.fetch");
    if(!valid.id(to))           return validE.valid("to");
    if(!validChannelId(chnl))   return validE.valid("chnl");
    if(!valid.num(start, 0))    return validE.valid("start");
    if(!valid.num(end, 0))      return validE.valid("end");

    let privChat = to.startsWith("$");
    if(privChat){
        const p1 = suser._id;
        const p2 = to.replace("$", "");
        to = combineId(p1, p2);
    }

    if(!privChat){
        const perm = await getChnlPerm(suser._id, to, chnl);
        if(!perm.view) return validE.err("channel is not exist");
    }

    const respondAll = await db.mess.find(to, { chnl }, {}, { reverse: true, max: end+start });
    const res = respondAll.slice(start, end);

    return { err: false, res };
}

export async function message_fetch_id(suser, to, chnl, mess_id){
    const validE = new ValidError("message.fetch.id");
    if(!valid.id(to))           return validE.valid("to");
    if(!valid.id(mess_id))      return validE.valid("mess_id");
    if(!validChannelId(chnl))   return validE.valid("chnl");

    let privChat = to.startsWith("$");
    if(privChat){
        const p1 = suser._id;
        const p2 = to.replace("$", "");
        to = combineId(p1, p2);
    }

    if(!privChat){
        const perm = await getChnlPerm(suser._id, to, chnl);
        if(!perm.view) return validE.err("channel is not exist");
    }

    const res = await db.mess.findOne(to, { _id: mess_id });
    return { err: false, res };
}

export async function message_markAsRead(suser, to, chnl, mess_id){
    const validE = new ValidError("message.markAsRead");
    if(!valid.id(to))                               return validE.valid("to");
    if(!validChannelId(chnl))                       return validE.valid("chnl");
    if(!valid.idOrSpecificStr(mess_id, ["last"]))   return validE.valid("mess_id");

    const friendChat = to.startsWith("$");
    
    const search = {};
    if(friendChat) search.priv = to.replace("$", "");
    else search.realm = to;

    let res;

    if(mess_id == "last"){
        let toM = to;
        if(friendChat){
            const p1 = suser._id;
            const p2 = to.replace("$", "");
            toM = combineId(p1, p2);
        }
        const lastIdMess = await db.mess.find(toM, { chnl }, {}, { reverse: true, max: 1 });
        if(lastIdMess.length == 0) return { err: false, res: "no messages in this channel" };

        mess_id = lastIdMess[0]._id;
        res = mess_id;
    }

    await db.userData.updateOne(suser._id, search, (data, context) => {
        if(!data.last) data.last = {};
        data.last[context.chnl] = context.mess_id;
        return data;
    }, { chnl, mess_id });

    return { err: false, res };
}

export async function message_react(suser, realm, msgId, react){
    const validE = new ValidError("message.react");
    if(!valid.id(realm.replace("$", ""))) return validE.valid("realm");
    if(!valid.id(msgId)) return validE.valid("msgId");
    if(!valid.str(react, 0, 30)) return validE.valid("react");

    let toM = realm;
    if(realm.startsWith("$")){
        const p1 = suser._id;
        const p2 = realm.replace("$", "");
        toM = combineId(p1, p2);
    }

    const msg = await db.mess.findOne(toM, { _id: msgId });
    if(!msg) return validE.err("msg does not exist");

    const chnl = msg.chnl;
    const perm = await getChnlPerm(suser._id, toM, chnl);
    if(!perm.react) return validE.err("not authorized");

    const reacts = msg.reacts || {};
    if(!reacts[react]) reacts[react] = [];
    
    if(reacts[react].includes(suser._id)){
        reacts[react] = reacts[react].filter(id => id != suser._id);
        if(reacts[react].length == 0) delete reacts[react];
    }else{
        reacts[react].push(suser._id);
    }

    await db.mess.updateOne(toM, { _id: msgId }, { reacts });

    if(realm.startsWith("$")){
        global.sendToSocket(suser._id, "message.react", suser._id, realm, msgId, react);
        global.sendToSocket(realm.replace("$", ""), "message.react", suser._id, "$"+suser._id, msgId, react);
    }else{
        global.sendToChatUsers(realm, "message.react", suser._id, realm, msgId, react);
    }

    return { err: false };
}

export async function message_search(suser, realm, chnl, query){
    const validE = new ValidError("message.search");
    if(!valid.id(realm))            return validE.valid("realm");
    if(!validChannelId(chnl))       return validE.valid("chnl");
    if(!messageSearchSchemat(query))  return validE.valid("search", messageSearchSchemat.errors);

    const priv = realm.startsWith("$");
    if(priv){
        const p1 = suser._id;
        const p2 = realm.replace("$", "");
        realm = combineId(p1, p2);
    }

    const res = await db.mess.find(realm, (data, context) => {
        if(data.chnl != chnl) return false;
        return filterMessages(context.query, data);
    }, { query });

    return { err: false, res };
}

export async function message_pin(suser, realm, chnl, msgId, pin){
    const validE = new ValidError("message.pin");
    if(!valid.id(realm))        return validE.valid("realm");
    if(!validChannelId(chnl))   return validE.valid("chnl");
    if(!valid.id(msgId))        return validE.valid("msgId");
    if(!valid.bool(pin))        return validE.valid("pin");
    
    const priv = realm.startsWith("$");
    let chat = realm;
    if(priv){
        const p1 = suser._id;
        const p2 = realm.replace("$", "");
        chat = combineId(p1, p2);
    }

    await db.mess.updateOne(chat, { _id: msgId }, { pinned: pin });
    const refreshData = {
        evt: "message.fetch.pinned",
        realm,
        chnl,
    }

    if(priv){
        global.sendToSocket(suser._id, "refreshData", refreshData, realm, chnl);
        refreshData.realm = "$"+suser._id;
        global.sendToSocket(realm.replace("$", ""), "refreshData", refreshData, "$"+suser._id, chnl);
    }else{
        global.sendToChatUsers(realm, "refreshData", refreshData, realm, chnl);
    }

    return { err: false };
}

export async function message_fetch_pinned(suser, realm, chnl){
    const validE = new ValidError("message.get.pinned");
    if(!valid.id(realm))        return validE.valid("realm");
    if(!validChannelId(chnl))   return validE.valid("chnl");
    
    const priv = realm.startsWith("$");
    if(priv){
        const p1 = suser._id;
        const p2 = realm.replace("$", "");
        realm = combineId(p1, p2);
    }

    const res = await db.mess.find(realm, (data, context) => {
        if(data.chnl != context.chnl) return false;
        return data.pinned === true;
    }, { chnl });

    return { err: false, res };
}

function filterMessages(query, mess){
    const time = extractTimeFromId(mess._id) * 1000;

    if(query.from && mess.fr !== query.from) return false;
    if(query.mentions && !mess.msg.includes(`@${query.mentions}`)) return false;

    if(query.before && time >= new Date(query.before).getTime()) return false;
    if(query.during){
        const startOfDay = new Date(query.during).setHours(0, 0, 0, 0);
        const endOfDay = new Date(query.during).setHours(23, 59, 59, 999);
        if(time < startOfDay || time > endOfDay) return false;
    }
    if(query.after && time <= new Date(query.after).getTime()) return false;
    if(query.pinned !== undefined && query.pinned !== (mess.pinned === true)) return false;
    if(query.message && !mess.msg.includes(query.message)) return false;

    return true;
}