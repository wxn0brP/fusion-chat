import { chatExists as _chatExists, combineId } from "./chatMgmt.js";
import valid, { validChannelId } from "./validData.js";
import ValidError from "./validError.js";
import getChnlPerm from "./chnlPermissionCache.js";
import db from "../dataBase.js";
import checkDmChat from "./sendMessageUtils/dm.js";
import announcementChnl from "./sendMessageUtils/announcementChnl.js";
import InternalCode from "../codes/index.js";
import firebaseSend from "../firebase.js";
const validE = new ValidError("mess");
export default async function sendMessage(req, user, options = {}) {
    options = prepareOptions(options);
    const errs = validData(req, user, options);
    if (errs)
        return errs;
    const processed = await processIdAndPerm(req, user, options);
    if (processed.err)
        return processed;
    const privChat = processed.res.privChat;
    const originalTo = req.to;
    const processedTo = processed.res.to;
    let data = {
        fr: options.frPrefix + user._id,
        msg: req.msg.trim(),
        chnl: req.chnl,
        ...(options.customFields || {}),
    };
    if (req.enc)
        data.enc = req.enc;
    if (req.res)
        data.res = req.res;
    const message = await db.mess.add(processedTo, data);
    data._id = message._id;
    if (req.silent)
        data.silent = req.silent || false;
    global.sendToSocket(user._id, "mess", Object.assign({ to: originalTo }, data));
    if (privChat)
        sendDmNotification(originalTo, user, data);
    else
        await sendReamNotification(originalTo, user, data);
    return { err: false };
}
function prepareOptions(options) {
    options = {
        system: false,
        minMsg: 0,
        maxMsg: 2000,
        frPrefix: "",
        ...options
    };
    return options;
}
function validData(req, user, options = {}) {
    if (!user)
        return validE.err(InternalCode.UserError.Socket.NotAuthorized);
    if (typeof req !== "object")
        return validE.valid("req");
    if (!valid.id(req.to))
        return validE.valid("to");
    if (!validChannelId(req.chnl))
        return validE.valid("chnl");
    if (!valid.str(req.msg, options.minMsg, options.maxMsg))
        return validE.valid("msg");
    if (req.enc && !valid.str(req.enc, 0, 30))
        return validE.valid("enc");
    if (req.res && !valid.id(req.res))
        return validE.valid("res");
    if (req.silent && !valid.bool(req.silent))
        return validE.valid("silent");
}
async function processIdAndPerm(req, user, options) {
    let { to, chnl } = req;
    const privChat = to.startsWith("$");
    if (privChat) {
        let p1 = user._id;
        let p2 = to.replace("$", "");
        to = combineId(p1, p2);
        const checkData = await checkDmChat(p1, p2, to, validE);
        if (checkData)
            return checkData;
        await db.mess.checkCollection(to);
    }
    else {
        const chatExists = await _chatExists(to);
        if (!chatExists)
            return validE.err(InternalCode.UserError.Socket.ChatIsNotFound);
    }
    if (!privChat && !options.system) {
        const perm = await getChnlPerm(user._id, to, chnl);
        if (!perm.view)
            return validE.err(InternalCode.UserError.Socket.ChannelIsNotFound);
        if (!perm.write)
            return validE.err(InternalCode.UserError.Socket.NoPermissionToWriteMessage);
        if (chnl.startsWith("&") && !perm.threadWrite)
            return validE.err(InternalCode.UserError.Socket.NoPermissionToWriteMessage);
    }
    return { err: false, res: { to, privChat } };
}
async function sendReamNotification(to, user, data) {
    const realm = await db.realmConf.findOne(to, { _id: "set" });
    const fromMsg = `${realm.name} @${user.name}`;
    data.to = to;
    db.realmUser.find(to, { $exists: { u: true } })
        .then(chat => {
        chat.forEach(async (chat_user) => {
            const uid = chat_user.u;
            if (uid == user._id)
                return;
            const realm = await db.userData.findOne(uid, { realm: to });
            if (realm && realm.muted && realm.muted != -1) {
                const muted = realm.muted;
                if (muted == 0)
                    return;
                if (muted > new Date().getTime())
                    return;
            }
            global.sendToSocket(uid, "mess", data);
            if (data.silent)
                return;
            firebaseSend({
                to: uid,
                title: "New message from " + fromMsg,
                body: data.msg,
                action: { type: "ctrl", data: [["cc", data.to + "_" + data.chnl]] }
            });
        });
    });
    db.realmUser.find(to, { $exists: { bot: true } })
        .then(botUsers => {
        botUsers.forEach(user => {
            global.getSocket(user.bot, "bot").forEach(connection => {
                connection.emit("mess", data);
            });
        });
    });
    await announcementChnl(to, data);
}
function sendDmNotification(to, user, data) {
    const toSend = to.replace("$", "");
    data.to = "$" + user._id;
    global.sendToSocket(toSend, "mess", data);
    if (data.silent)
        return;
    firebaseSend({
        to: toSend,
        title: "New message from " + user.name,
        body: data.msg,
        action: { type: "ctrl", data: [["chat", "$" + user._id]] }
    });
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2VuZE1lc3NhZ2UuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9iYWNrL2xvZ2ljL3NlbmRNZXNzYWdlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxVQUFVLElBQUksV0FBVyxFQUFFLFNBQVMsRUFBRSxNQUFNLFlBQVksQ0FBQztBQUNsRSxPQUFPLEtBQUssRUFBRSxFQUFFLGNBQWMsRUFBRSxNQUFNLGFBQWEsQ0FBQztBQUNwRCxPQUFPLFVBQVUsTUFBTSxjQUFjLENBQUM7QUFDdEMsT0FBTyxXQUFXLE1BQU0sdUJBQXVCLENBQUM7QUFDaEQsT0FBTyxFQUFFLE1BQU0sS0FBSyxDQUFDO0FBQ3JCLE9BQU8sV0FBVyxNQUFNLHVCQUF1QixDQUFDO0FBQ2hELE9BQU8sZ0JBQWdCLE1BQU0scUNBQXFDLENBQUM7QUFPbkUsT0FBTyxZQUFZLE1BQU0sUUFBUSxDQUFDO0FBQ2xDLE9BQU8sWUFBWSxNQUFNLFdBQVcsQ0FBQztBQUVyQyxNQUFNLE1BQU0sR0FBRyxJQUFJLFVBQVUsQ0FBQyxNQUFNLENBQUMsQ0FBQztBQVd0QyxNQUFNLENBQUMsT0FBTyxDQUFDLEtBQUssVUFBVSxXQUFXLENBQUMsR0FBWSxFQUFFLElBQVUsRUFBRSxVQUFtQixFQUFFO0lBQ3JGLE9BQU8sR0FBRyxjQUFjLENBQUMsT0FBTyxDQUFDLENBQUM7SUFFbEMsTUFBTSxJQUFJLEdBQUcsU0FBUyxDQUFDLEdBQUcsRUFBRSxJQUFJLEVBQUUsT0FBTyxDQUFDLENBQUM7SUFDM0MsSUFBSSxJQUFJO1FBQUUsT0FBTyxJQUFJLENBQUM7SUFFdEIsTUFBTSxTQUFTLEdBQUcsTUFBTSxnQkFBZ0IsQ0FBQyxHQUFHLEVBQUUsSUFBSSxFQUFFLE9BQU8sQ0FBQyxDQUFDO0lBQzdELElBQUksU0FBUyxDQUFDLEdBQUc7UUFBRSxPQUFPLFNBQVMsQ0FBQztJQUVwQyxNQUFNLFFBQVEsR0FBRyxTQUFTLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQztJ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