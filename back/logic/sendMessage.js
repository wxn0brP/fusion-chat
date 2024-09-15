const chatMgmt = require("./chatMgmt");
const valid = require("./validData");

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
 * @return {Promise<object>} res - The result of the message sending operation.
 * @return {false|string[]} res.err - The error message or array of error messages if any.
 */
async function sendMessage(req, user){
    if(!user) return { err: ["error", "not auth"] };
    if(typeof req !== "object") return { err: ["error.valid", "mess", "req"] };
    let { to, msg, chnl } = req;

    if(!valid.id(to))                           return { err: ["error.valid", "mess", "to"] };
    if(!valid.idOrSpecyficStr(chnl, ["main"]))  return { err: ["error.valid", "mess", "chnl"] };
    if(!valid.str(msg, 0, 2000))                return { err: ["error.valid", "mess", "msg"] };

    //optional
    if(req.enc && !valid.str(req.enc, 0, 30))   return { err: ["error.valid", "mess", "enc"] };
    if(req.res && !valid.id(req.res))           return { err: ["error.valid", "mess", "res"] };
    if(req.silent && !valid.bool(req.silent))   return { err: ["error.valid", "mess", "silent"] };
    
    let privChat = to.startsWith("$");
    if(privChat){
        const priv = await global.db.userDatas.findOne(user._id, { priv: to.replace("$", "") });
        if(!priv) return { err: ["error", "priv not found"] };
        if(priv.blocked) return { err: ["error", "blocked"] };

        const toPriv = await global.db.userDatas.findOne(to.replace("$", ""), { priv: user._id });
        if(!toPriv) return { err: ["error", "priv not found"] };
        if(toPriv.blocked) return { err: ["error", "blocked"] };

        let p1 = user._id;
        let p2 = to.replace("$", "");
        to = chatMgmt.combinateId(p1, p2);
        global.db.mess.checkCollection(to);
    }else{
        if(!chatMgmt.chatExsists(to)) return { err: ["error", "chat is not exists"] };
    }

    if(!privChat){
        const perm = await getChnlPerm(user._id, to, chnl); 
        if(!perm.visable) return { err: ["error", "channel is not exists"] };
        if(!perm.text) return { err: ["error", "not perm to write"] };
    }

    let message = msg.trim();
    if(msg.length > 500) return { err: ["error", "msg is too long"] };
    
    let data = {
        fr: user._id,
        msg: message,
        chnl,
    }
    if(req.enc) data.enc = req.enc;
    if(req.res) data.res = req.res;

    let _id = await global.db.mess.add(to, data);

    if(!privChat) data.to = to;
    else data.to = "$"+user._id;
    
    data._id = _id._id;
    if(req.silent) data.silent = req.silent || false;
    sendToSocket(user._id, "mess", {
        fr: user._id,
        msg: data.msg,
        chnl,
        to: "@",
        toM: req.to,
        _id: _id._id,
        enc: data.enc || undefined,
        res: data.res || undefined,
    });

    if(!privChat){
        data.toM = to;
        let chat = await global.db.usersPerms.find(to, r => r.uid);
        const server = (await global.db.groupSettings.findOne(to, { _id: "set"}));
        const fromMsg = `${server.name} @${user.name}`;

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
        })
    }else{
        let toSend = req.to.replace("$","");

        data.toM = user._id;
        sendToSocket(toSend, "mess", data);

        const user = await global.db.data.findOne("user", { _id: user._id });
        if(!data.silent) global.fireBaseMessage.send(toSend, "New message from " + user.name, data.msg);
    }

    return { err: false };
}

module.exports = sendMessage;