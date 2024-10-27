import { combinateId } from "../../../logic/chatMgmt.js";
import valid from "../../../logic/validData.js";
import permissionSystem from "../../../logic/permission-system/index.js";
import { extractTimeFromId } from "../../../logic/utils.js";
import messageSearchData from "../valid/messageSearch.js";
import ValidError from "../../../logic/validError.js";

const messageSearchShema = valid.objAjv(messageSearchData);

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
        to = combinateId(p1, p2);
    }

    const mess = await global.db.mess.findOne(to, { _id });
    if(!mess){
        return validE.err("message does not exist");
    }
    if(mess.fr !== suser._id){
        return validE.err("not authorized");
    }

    const time = global.getTime();
    await global.db.mess.updateOne(to, { _id }, { msg, lastEdit: time });

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
        to = combinateId(p1, p2);
    }

    const mess = await global.db.mess.findOne(to, { _id });
    if(!mess){
        return validE.err("message does not exist");
    }
    if(mess.fr !== suser._id){
        const perm = new permissionSystem(to);
        if(!perm.userPermison(suser._id, "manage text")){
            return validE.err("not authorized");
        }
    }

    await global.db.mess.removeOne(to, { _id });
    if(privChat){
        sendToSocket(suser._id,       "message.delete", _id);
        sendToSocket(toM.replace("$", ""),  "message.delete", _id);
    }else{
        sendToChatUsers(toM, "message.delete", _id);
    }

    return { err: false };
}

export async function message_fetch(suser, to, chnl, start, end){
    const validE = new ValidError("message.fetch");
    if(!valid.id(to))                           return validE.valid("to");
    if(!valid.idOrSpecyficStr(chnl, ["main"]))  return validE.valid("chnl");
    if(!valid.num(start, 0))                    return validE.valid("start");
    if(!valid.num(end, 0))                      return validE.valid("end");

    let privChat = to.startsWith("$");
    if(privChat){
        const p1 = suser._id;
        const p2 = to.replace("$", "");
        to = combinateId(p1, p2);
    }

    if(!privChat){
        const perm = await getChnlPerm(suser._id, to, chnl);
        if(!perm.visable) return validE.err("channel is not exist");
    }

    const responeAll = await global.db.mess.find(to, { chnl }, {}, { reverse: true, max: end+start });
    const res = responeAll.slice(start, end);

    return { err: false, res };
}

export async function message_fetch_id(suser, to, chnl, mess_id){
    const validE = new ValidError("message.fetch.id");
    if(!valid.id(to))       return validE.valid("to");
    if(!valid.id(mess_id))  return validE.valid("mess_id");
    if(!valid.idOrSpecyficStr(chnl, ["main"])) return validE.valid("chnl");

    let privChat = to.startsWith("$");
    if(privChat){
        const p1 = suser._id;
        const p2 = to.replace("$", "");
        to = combinateId(p1, p2);
    }

    if(!privChat){
        const perm = await getChnlPerm(suser._id, to, chnl);
        if(!perm.visable) return validE.err("channel is not exist");
    }

    const res = await global.db.mess.findOne(to, { _id: mess_id });
    return { err: false, res };
}

export async function message_markAsRead(suser, to, chnl, mess_id){
    const validE = new ValidError("message.markAsRead");
    if(!valid.id(to)) return validE.valid("to");
    if(!valid.idOrSpecyficStr(chnl, ["main"]))      return validE.valid("chnl");
    if(!valid.idOrSpecyficStr(mess_id, ["last"]))   return validE.valid("mess_id");

    const firendChat = to.startsWith("$");
    
    const search = {};
    if(firendChat) search.priv = to.replace("$", "");
    else search.group = to;

    if(mess_id == "last"){
        let toM = to;
        if(firendChat){
            const p1 = suser._id;
            const p2 = to.replace("$", "");
            toM = combinateId(p1, p2);
        }
        const lastIdMess = await global.db.mess.find(toM, { chnl }, {}, { reverse: true, max: 1 });
        if(lastIdMess.length == 0) return { err: false, res: "no messages in this channel" };

        mess_id = lastIdMess[0]._id;
        return { err: false, res: [to, chnl, mess_id] };
    }

    await global.db.userDatas.updateOne(suser._id, search, (data, context) => {
        if(!data.last) data.last = {};
        data.last[context.chnl] = context.mess_id;
        return data;
    }, { chnl, mess_id });

    return { err: false };
}

export async function message_react(suser, server, msgId, react){
    const validE = new ValidError("message.react");
    if(!valid.id(server.replace("$", ""))) return validE.valid("server");
    if(!valid.id(msgId)) return validE.valid("msgId");
    if(!valid.str(react, 0, 30)) return validE.valid("react");

    let toM = server;
    if(server.startsWith("$")){
        const p1 = suser._id;
        const p2 = server.replace("$", "");
        toM = combinateId(p1, p2);
    }
    const msg = await global.db.mess.findOne(toM, { _id: msgId });
    if(!msg) return validE.err("msg does not exist");

    const reacts = msg.reacts || {};
    if(!reacts[react]) reacts[react] = [];
    
    if(reacts[react].includes(suser._id)){
        reacts[react] = reacts[react].filter(id => id != suser._id);
        if(reacts[react].length == 0) delete reacts[react];
    }else{
        reacts[react].push(suser._id);
    }

    await global.db.mess.updateOne(toM, { _id: msgId }, { reacts });

    if(server.startsWith("$")){
        global.sendToSocket(suser._id, "message.react", suser._id, server, msgId, react);
        global.sendToSocket(server.replace("$", ""), "message.react", suser._id, "$"+suser._id, msgId, react);
    }else{
        global.sendToChatUsers(server, "message.react", suser._id, server, msgId, react);
    }

    return { err: false };
}

export async function message_search(suser, server, chnl, query){
    const validE = new ValidError("message.search");
    if(!valid.id(server)) return validE.valid("server");
    if(!valid.idOrSpecyficStr(chnl, ["main"])) return validE.valid("chnl");
    if(!messageSearchShema(query))
        return validE.valid("search", messageSearchShema.errors);

    const priv = server.startsWith("$");
    if(priv){
        const p1 = suser._id;
        const p2 = server.replace("$", "");
        server = combinateId(p1, p2);
    }

    const res = await global.db.mess.find(server, (data, context) => {
        if(data.chnl != chnl) return false;
        return filterMessages(context.query, data);
    }, { query });

    return { err: false, res };
}

export async function message_pin(suser, server, chnl, msgId, pin){
    const validE = new ValidError("message.pin");
    if(!valid.id(server)) return validE.valid("server");
    if(!valid.idOrSpecyficvalid(chnl, ["main"])) return validE.valid("chnl");
    if(!valid.id(msgId)) return validE.valid("msgId");
    if(!valid.bool(pin)) return validE.valid("pin");
    
    const priv = server.startsWith("$");
    let chat = server;
    if(priv){
        const p1 = suser._id;
        const p2 = server.replace("$", "");
        chat = combinateId(p1, p2);
    }

    await global.db.mess.updateOne(chat, { _id: msgId }, { pinned: pin });
    const refreshData = {
        evt: "message.fetch.pinned",
        server,
        chnl,
    }

    if(priv){
        global.sendToSocket(suser._id, "refreshData", refreshData, server, chnl);
        refreshData.server = "$"+suser._id;
        global.sendToSocket(server.replace("$", ""), "refreshData", refreshData, "$"+suser._id, chnl);
    }else{
        global.sendToChatUsers(server, "refreshData", refreshData, server, chnl);
    }

    return { err: false };
}

export async function message_fetch_pinned(suser, server, chnl){
    const validE = new ValidError("message.get.pinned");
    if(!valid.id(server)) return validE.valid("server");
    if(!valid.idOrSpecyficStr(chnl, ["main"])) return validE.valid("chnl");
    
    const priv = server.startsWith("$");
    if(priv){
        const p1 = suser._id;
        const p2 = server.replace("$", "");
        server = combinateId(p1, p2);
    }

    const res = await global.db.mess.find(server, (data, context) => {
        if(data.chnl != context.chnl) return false;
        return data.pinned === true;
    }, { chnl });

    return { err: false, res };
}

global.getChnlPerm = async function(user, server, chnl){
    const permission = new permissionSystem(server);
    const channel = await global.db.groupSettings.findOne(server, (c, context) => c.chid == context.chnl, { chnl });
    if(!channel) return {
        visable: false,
        text: false
    };

    const userRoles = await permission.getUserRoles(user);
    const alt = channel.rp.length == 0 || await permission.userPermison(user, "all");

    const visables = [];
    const texts = [];
    channel.rp.forEach(rp => {
        const [id, p] = rp.split("/");
        if(p == "visable") visables.push(id);
        if(p == "text") texts.push(id);
    });

    const visable = alt || visables.some(id => userRoles.includes(id));
    const text = alt || texts.some(id => userRoles.includes(id));

    return {
        visable,
        text
    };
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