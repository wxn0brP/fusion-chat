// @ts-check
import { chatExists as _chatExists, combineId } from "./chatMgmt.js";
import valid, { validChannelId } from "./validData.js";
import ValidError from "./validError.js";
import getChnlPerm from "./chnlPermissionCache.js";
import db from "../dataBase.js";
import checkDmChat from "./sendMessageUtils/dm.js";
import eventChnl from "./sendMessageUtils/eventChnl.js";

const validE = new ValidError("mess");

/**
 * @typedef {import("../types/sendMessage").Request} Request
 * @typedef {import("../types/sendMessage").User} User
 * @typedef {import("../types/sendMessage").Options} Options
 * @typedef {import("../types/sendMessage").Response} Response 
 * @typedef {import("../types/sendMessage").Message} Message 
 * @typedef {import("../types/base").Id} Id 
 */

/**
 * @async
 * Sends a message to a chat.
 * 
 * @param {Request} req - The message request object.
 * @param {User} user - The user sending the message.
 * @param {Options} options - Additional options for the message.
 * @returns {Promise<Response>} - An object containing the error message or the message data.
 */
export default async function sendMessage(req, user, options = {}) {
    options = prepareOptions(options);

    const errs = validData(req, user, options);
    if (errs) return errs;

    const processed = await processIdAndPerm(req, user, options);
    if (processed.err) return processed; // ir returns validE

    const privChat = processed.privChat;
    const originalTo = req.to;
    const processedTo = processed.to;

    /** @type {Message} */
    let data = {
        fr: options.frPrefix + user._id,
        msg: req.msg.trim(),
        chnl: req.chnl,
        ...(options.customFields || {}),
    }

    if (req.enc) data.enc = req.enc;
    if (req.res) data.res = req.res;

    const message = await db.mess.add(processedTo, data);
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
 * @param {Options} options
 * @returns {Options}
 */
function prepareOptions(options) {
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
 * @param {Request} req
 * @param {User} user
 * @param {Options} options
 * @returns {Response|undefined}
 */
function validData(req, user, options = {}) {
    if (!user) return validE.err("not auth");
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
 * @param {Request} req - The request object containing message details including recipient and channel.
 * @param {User} user - The user object representing the sender of the message.
 * @param {Options} options - An object containing optional settings for the message processing.
 * @returns {Promise<Object|Error>} - Returns an object with the processed recipient ID and chat type or an error if validation fails.
 */
async function processIdAndPerm(req, user, options) {
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
        if (!chatExists) return validE.err("chat is not exists");
    }

    if (!privChat && !options.system) {
        const perm = await getChnlPerm(user._id, to, chnl);
        if (!perm.view) return validE.err("channel is not exists");
        if (!perm.write) return validE.err("not perm to write");
        if (chnl.startsWith("&") && !perm.threadWrite) return validE.err("not perm to write");
    }

    return { to, privChat };
}

/**
 * @param {Id} to
 * @param {User} user
 * @param {Message} data
 */
async function sendReamNotification(to, user, data) {
    const realm = await db.realmConf.findOne(to, { _id: "set" });
    const fromMsg = `${realm.name} @${user.name}`;
    data.to = to;

    db.realmUser.find(to, { $exists: { u: true } })
        .then(chat => {
            chat.forEach(async chat_user => {
                const uid = chat_user.u;
                if (uid == user._id) return;

                const realm = await db.userData.findOne(uid, { realm: to });
                if (realm && realm.muted && realm.muted != -1) {
                    const muted = realm.muted;
                    if (muted == 0) return;
                    if (muted > new Date().getTime()) return;
                }

                global.sendToSocket(uid, "mess", data);
                if (data.silent) return;
                
                global.fireBaseMessage.send({
                    to: uid,
                    title: "New message from " + fromMsg,
                    body: data.msg,
                    action: { type: "ctrl", data: [["cc", data.to + "_" + data.chnl]] }
                });
            });
        })

    db.realmUser.find(to, { $exists: { bot: true } })
        .then(botUsers => {
            botUsers.forEach(user => {
                global.getSocket(user.bot, "bot").forEach(connection => {
                    connection.emit("mess", data);
                });
            });
        });

    await eventChnl(to, data);
}

/**
* @param {Id} to
* @param {User} user
* @param {Message} data
*/
function sendDmNotification(to, user, data) {
    const toSend = to.replace("$", "");
    data.to = "$" + user._id;
    global.sendToSocket(toSend, "mess", data);

    if (data.silent) return;

    global.fireBaseMessage.send({
        to: toSend,
        title: "New message from " + user.name,
        body: data.msg,
        action: { type: "ctrl", data: [["chat", "$" + user._id]] }
    });
}