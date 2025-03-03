import { chatExists as _chatExists, combineId } from "./chatMgmt";
import valid, { validChannelId } from "./validData";
import ValidError from "./validError";
import getChnlPerm from "./chnlPermissionCache";
import db from "#db";
import checkDmChat from "./sendMessageUtils/dm";
import announcementChnl from "./sendMessageUtils/announcementChnl";
import Db_RealmConf from "#types/db/realmConf";
import Db_UserData from "#types/db/userData";
import Db_RealmUser from "#types/db/realmUser";
import { Message, Options, Request, User } from "#types/sendMessage";
import { Socket_StandardRes } from "#types/socket/res";
import Id from "#id";
import InternalCode from "#codes";
import firebaseSend from "#firebase";

const validE = new ValidError("mess");

/**
 * @async
 * Sends a message to a chat.
 * 
 * @param req - The message request object.
 * @param  user - The user sending the message.
 * @param options - Additional options for the message.
 * @returns - An object containing the error message or the message data.
 */
export default async function sendMessage(req: Request, user: User, options: Options = {}): Promise<Socket_StandardRes> {
    options = prepareOptions(options);

    const errs = validData(req, user, options);
    if (errs) return errs;

    const processed = await processIdAndPerm(req, user, options);
    if (processed.err) return processed; // ir returns validE

    const privChat = processed.res.privChat;
    const originalTo = req.to;
    const processedTo = processed.res.to;

    let data: Message = {
        fr: options.frPrefix + user._id,
        msg: req.msg.trim(),
        chnl: req.chnl,
        ...(options.customFields || {}),
    }

    if (req.enc) data.enc = req.enc;
    if (req.res) data.res = req.res;

    const message = await db.mess.add<Message>(processedTo, data);
    data._id = message._id;

    if (req.silent) data.silent = req.silent || false;

    global.sendToSocket(user._id, "mess", Object.assign({ to: originalTo }, data));

    if (privChat)
        sendDmNotification(originalTo, user, data);
    else
        await sendReamNotification(originalTo, user, data);

    return { err: false };
}

/** 
 * Prepares the options for the sendMessage function.
 * @param options
 */
function prepareOptions(options: Options) {
    options = {
        system: false,
        minMsg: 0,
        maxMsg: 2000,
        frPrefix: "",
        ...options
    }
    return options;
}

/**
 * Validates the message data.
 */
function validData(req: Request, user: User, options: Options = {}) {
    if (!user) return validE.err(InternalCode.UserError.Socket.NotAuthorized);
    if (typeof req !== "object") return validE.valid("req");

    if (!valid.id(req.to)) return validE.valid("to");
    if (!validChannelId(req.chnl)) return validE.valid("chnl");
    if (!valid.str(req.msg, options.minMsg, options.maxMsg)) return validE.valid("msg");

    //optional
    if (req.enc && !valid.str(req.enc, 0, 30)) return validE.valid("enc");
    if (req.res && !valid.id(req.res)) return validE.valid("res");
    if (req.silent && !valid.bool(req.silent)) return validE.valid("silent");
}

/**
 * Processes the recipient ID and permissions for a message request.
 * Determines if the message is for a private chat or a regular chat.
 * Checks if the private chat exists or if the user has permissions
 * to view and write in the regular chat channel.
 *
 * @param req - The request object containing message details including recipient and channel.
 * @param user - The user object representing the sender of the message.
 * @param options - An object containing optional settings for the message processing.
 * @returns Returns an object with the processed recipient ID and chat type or an error if validation fails.
 */
async function processIdAndPerm(req: Request, user: User, options: Options): Promise<Socket_StandardRes> {
    let { to, chnl } = req;

    const privChat = to.startsWith("$");
    if (privChat) {
        let p1 = user._id;
        let p2 = to.replace("$", "");
        to = combineId(p1, p2);

        const checkData = await checkDmChat(p1, p2, to, validE);
        if (checkData) return checkData;

        await db.mess.checkCollection(to);
    } else {
        const chatExists = await _chatExists(to);
        if (!chatExists) return validE.err(InternalCode.UserError.Socket.ChatIsNotFound);
    }

    if (!privChat && !options.system) {
        const perm = await getChnlPerm(user._id, to, chnl);
        if (!perm.view) return validE.err(InternalCode.UserError.Socket.ChannelIsNotFound);
        if (!perm.write) return validE.err(InternalCode.UserError.Socket.NoPermissionToWriteMessage);
        if (chnl.startsWith("&") && !perm.threadWrite) return validE.err(InternalCode.UserError.Socket.NoPermissionToWriteMessage);
    }

    return { err: false, res: { to, privChat } };
}

async function sendReamNotification(to: Id, user: User, data: Message) {
    const realm = await db.realmConf.findOne<Db_RealmConf.meta>(to, { _id: "set" });
    const fromMsg = `${realm.name} @${user.name}`;
    data.to = to;

    db.realmUser.find<Db_RealmUser.user>(to, { $exists: { u: true } })
        .then(chat => {
            chat.forEach(async chat_user => {
                const uid = chat_user.u;
                if (uid == user._id) return;

                const realm = await db.userData.findOne<Db_UserData.realm>(uid, { realm: to });
                if (realm && realm.muted && realm.muted != -1) {
                    const muted = realm.muted;
                    if (muted == 0) return;
                    if (muted > new Date().getTime()) return;
                }

                global.sendToSocket(uid, "mess", data);
                if (data.silent) return;

                firebaseSend({
                    to: uid,
                    title: "New message from " + fromMsg,
                    body: data.msg,
                    action: { type: "ctrl", data: [["cc", data.to + "_" + data.chnl]] }
                });
            });
        })

    db.realmUser.find<Db_RealmUser.bot>(to, { $exists: { bot: true } })
        .then(botUsers => {
            botUsers.forEach(user => {
                global.getSocket(user.bot, "bot").forEach(connection => {
                    connection.emit("mess", data);
                });
            });
        });

    await announcementChnl(to, data);
}

function sendDmNotification(to: Id, user: User, data: Message) {
    const toSend = to.replace("$", "");
    data.to = "$" + user._id;
    global.sendToSocket(toSend, "mess", data);

    if (data.silent) return;

    firebaseSend({
        to: toSend,
        title: "New message from " + user.name,
        body: data.msg,
        action: { type: "ctrl", data: [["chat", "$" + user._id]] }
    });
}