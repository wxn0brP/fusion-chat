import { chatExsists as _chatExsists, combinateId } from "./chatMgmt.js";
import valid from "./validData.js";
import ValidError from "./validError.js";

/**
 * @async
 * Sends a message to a chat.
 * Validates the message request and checks if the chat exists.
 * Supports both friend chats and channel chats.
 * @param {object} req - The request object containing message details.
 * @param {string} req.to - The identifier of the recipient or chat.
 * @param {string} req.msg - The message content.
 * @param {string} req.chnl - The channel identifier.
 * @param {string} [req.enc] - Optional flag to indicate if the message is encrypted.
 * @param {string} [req.res] - Optional identifier for the message being replied to.
 * @param {boolean} [req.silent] - Optional flag to send the message silently without notification.
 * @param {object} user - The user object of the sender.
 * @param {string} user._id - The identifier of the sender.
 * @param {string} user.name - The name of the sender.
 * @param {object} [options] - Optional options object.
 * @param {boolean} [options.system] - Optional flag to send the message as a system message. Default is false.
 * @param {boolean} [options.customFields] - Optional flag to send the message with custom fields.
 * @param {number} [options.minMsg] - Optional minimum number of messages to send. Default is 0.
 * @param {number} [options.maxMsg] - Optional maximum number of messages to send. Default is 2000.
 * @return {Promise<object>} res - The result of the message sending operation.
 * @return {false|string[]} res.err - The error message or array of error messages if any.
 */
export default async function sendMessage(req, user, options={}){
    const validE = new ValidError("mess");
    if(!user) return validE.err("not auth");
    if(typeof req !== "object") return validE.valid("req");
    let { to, msg, chnl } = req;
    options = {
        system: false,
        minMsg: 0,
        maxMsg: 2000,
        frPrefix: "",
        ...options
    }

    if(!valid.id(to))                                   return validE.valid("to");
    if(!valid.idOrSpecyficStr(chnl, ["main"]))          return validE.valid("chnl");
    if(!valid.str(msg, options.minMsg, options.maxMsg)) return validE.valid("msg");

    //optional
    if(req.enc && !valid.str(req.enc, 0, 30))   return validE.valid("enc");
    if(req.res && !valid.id(req.res))           return validE.valid("res");
    if(req.silent && !valid.bool(req.silent))   return validE.valid("silent");
    
    const privChat = to.startsWith("$");
    if(privChat){
        const priv = await global.db.userDatas.findOne(user._id, { priv: to.replace("$", "") });
        if(!priv) return validE.err("priv not found");
        if(priv.blocked) return validE.err("blocked");

        const toPriv = await global.db.userDatas.findOne(to.replace("$", ""), { priv: user._id });
        if(!toPriv) return validE.err("priv not found");
        if(toPriv.blocked) return validE.err("blocked");

        let p1 = user._id;
        let p2 = to.replace("$", "");
        to = combinateId(p1, p2);
        await global.db.mess.checkCollection(to);
    }else{
        const chatExsists = await _chatExsists(to);
        if(!chatExsists) return validE.err("chat is not exists");
    }

    if(!privChat && !options.system){
        const perm = await getChnlPerm(user._id, to, chnl); 
        if(!perm.visable) return validE.err("channel is not exists");
        if(!perm.text) return validE.err("not perm to write");
    }

    let data = {
        fr: options.frPrefix+user._id,
        msg: msg.trim(),
        chnl,
        ...(options.customFields || {}),
    }
    if(req.enc) data.enc = req.enc;
    if(req.res) data.res = req.res;

    const message = await global.db.mess.add(to, data);
    data._id = message._id;

    if(!privChat) data.to = to;
    else data.to = "$"+user._id;
    
    if(req.silent) data.silent = req.silent || false;
    
    sendToSocket(user._id, "mess", Object.assign({}, data, {
        to: "@",
        toM: to
    }));

    if(!privChat){
        data.toM = to;
        const server = await global.db.groupSettings.findOne(to, { _id: "set"});
        const fromMsg = `${server.name} @${user.name}`;
        
        global.db.usersPerms.find(to, r => r.uid)
        .then(chat => {
            chat.forEach(async u => {
                u = u.uid;
                if(u == user._id) return;
    
                const group = await global.db.userDatas.findOne(u, { group: data.to });
                if(group.muted && group.muted != -1){
                    const muted = group.muted;
                    if(muted == 0) return;
                    if(muted > new Date().getTime()) return;
                }
    
                sendToSocket(u, "mess", data);
                if(!data.silent) global.fireBaseMessage.send(u, "New message from " + fromMsg, data.msg);
            });
        })

        global.db.usersPerms.find(to, { $exists: { bot: true }})
        .then(botUsers => {
            botUsers.forEach(user => {
                getSocket(user.bot, "bot").forEach(conn => {
                    conn.emit("mess", data);
                });
            });
        });
    }else{
        const toSend = req.to.replace("$","");

        data.toM = user._id;
        sendToSocket(toSend, "mess", data);
        if(!data.silent) global.fireBaseMessage.send(toSend, "New message from " + user.name, data.msg);
    }

    return { err: false };
}