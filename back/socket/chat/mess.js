const chatMgmt = require("../../logic/chatMgmt");
const valid = require("../../logic/validData");
const permissionSystem = require("../../logic/permission-system");
const { extractTimeFromId } = require("../../logic/utils");

const validShema = {
    messageSearch: valid.objAjv(require("./valid/messageSearch")),
};

module.exports = (socket) => {
    socket.ontimeout("mess", 200,
    /**
     * Handles the 'mess' event for sending messages in a chat.
     * Validates the message request, checks if the chat exists, and sends the message to the recipient.
     * Supports both friend chats and channel chats.
     *
     * @param {object} req - The request object containing message details.
     * @param {string} req.to - The identifier of the recipient or chat.
     * @param {string} req.msg - The message content.
     * @param {string} req.chnl - The channel identifier.
     * @param {string} [req.enc] - Optional flag to indicate if the message is encrypted.
     * @param {string} [req.res] - Optional identifier for the message being replied to.
     * @param {boolean} [req.silent] - Optional flag to send the message silently without notification.
     */
    async (req) => {
        try{
            if(!socket.user) return socket.emit("error", "not auth");
            if(typeof req !== "object") return socket.emit("error.valid", "mess", "req");
            let { to, msg, chnl } = req;
    
            if(!valid.id(to))                           return socket.emit("error.valid", "mess", "to");
            if(!valid.idOrSpecyficStr(chnl, ["main"]))  return socket.emit("error.valid", "mess", "chnl");
            if(!valid.str(msg, 0, 2000))                return socket.emit("error.valid", "mess", "msg");

            //optional
            if(req.enc && !valid.str(req.enc, 0, 30))   return socket.emit("error.valid", "mess", "enc");
            if(req.res && !valid.id(req.res))           return socket.emit("error.valid", "mess", "res");
            if(req.silent && !valid.bool(req.silent))   return socket.emit("error.valid", "mess", "silent");
            
            let privChat = to.startsWith("$");
            if(privChat){
                const priv = await global.db.userDatas.findOne(socket.user._id, { priv: to.replace("$", "") });
                if(!priv) return socket.emit("error", "priv not found");
                if(priv.blocked) return socket.emit("error", "blocked");

                const toPriv = await global.db.userDatas.findOne(to.replace("$", ""), { priv: socket.user._id });
                if(!toPriv) return socket.emit("error", "priv not found");
                if(toPriv.blocked) return socket.emit("error", "blocked");

                let p1 = socket.user._id;
                let p2 = to.replace("$", "");
                to = chatMgmt.combinateId(p1, p2);
                global.db.mess.checkCollection(to);
            }else{
                if(!chatMgmt.chatExsists(to)) return socket.emit("error", "chat is not exists");
            }

            if(!privChat){
                const perm = await getChnlPerm(socket.user._id, to, chnl); 
                if(!perm.visable) return socket.emit("error", "channel is not exists");
                if(!perm.text) return socket.emit("error", "not perm to write");
            }
    
            let message = msg.trim();
            if(msg.length > 500) return socket.emit("error", "msg is too long");
            
            let data = {
                fr: socket.user._id,
                msg: message,
                chnl,
            }
            if(req.enc) data.enc = req.enc;
            if(req.res) data.res = req.res;
    
            let _id = await global.db.mess.add(to, data);
    
            if(!privChat) data.to = to;
            else data.to = "$"+socket.user._id;
            
            data._id = _id._id;
            if(req.silent) data.silent = req.silent || false;
            sendToSocket(socket.user._id, "mess", {
                fr: socket.user._id,
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
                const fromMsg = "(S) " + server.name;

                chat.forEach(async u => {
                    u = u.uid;
                    if(u == socket.user._id) return;

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

                data.toM = socket.user._id;
                sendToSocket(toSend, "mess", data);

                const user = await global.db.data.findOne("user", { _id: socket.user._id });
                if(!data.silent) global.fireBaseMessage.send(toSend, "New message from " + user.name, data.msg);
            }
        }catch(e){
            socket.logError(e);
        }
    });

    socket.ontimeout("message.edit", 1000, async (toM, _id, msg) => {
        try{
            if(!socket.user) return socket.emit("error", "not auth");
            if(!valid.id(toM)) return socket.emit("error.valid", "message.edit", "toM");
            if(!valid.id(_id)) return socket.emit("error.valid", "message.edit", "_id");
            if(!valid.str(msg, 0, 500)) return socket.emit("error.valid", "message.edit", "msg");

            const privChat = toM.startsWith("$");
            let to = toM;
            if(privChat){
                const p1 = socket.user._id;
                const p2 = to.replace("$", "");
                to = chatMgmt.combinateId(p1, p2);
            }

            const mess = await global.db.mess.findOne(to, { _id });
            if(!mess){
                return socket.emit("error", "message does not exist");
            }
            if(mess.fr !== socket.user._id){
                return socket.emit("error", "not authorized");
            }

            const time = global.getTime();
            await global.db.mess.updateOne(to, { _id }, { msg, lastEdit: time });

            if(privChat){
                sendToSocket(socket.user._id,       "message.edit", _id, msg, time);
                sendToSocket(toM.replace("$", ""),  "message.edit", _id, msg, time);
            }else{
                sendToChatUsers(toM, "message.edit", _id, msg, time);
            }
        }catch(e){
            socket.logError(e);
        }
    });
    
    socket.ontimeout("message.delete", 1000, async (toM, _id) => {
        try{
            if(!socket.user) return socket.emit("error", "not auth");
            
            if(!valid.id(toM)) return socket.emit("error.valid", "message.delete", "toM");
            if(!valid.id(_id)) return socket.emit("error.valid", "message.delete", "_id");

            const privChat = toM.startsWith("$");
            let to = toM;
            if(privChat){
                const p1 = socket.user._id;
                const p2 = to.replace("$", "");
                to = chatMgmt.combinateId(p1, p2);
            }

            const mess = await global.db.mess.findOne(to, { _id });
            if(!mess){
                return socket.emit("error", "message does not exist");
            }
            if(mess.fr !== socket.user._id){
                const perm = new permissionSystem(to);
                if(!perm.userPermison(socket.user._id, "manage text")){
                    return socket.emit("error", "not authorized");
                }
            }

            await global.db.mess.removeOne(to, { _id });
            if(privChat){
                sendToSocket(socket.user._id,       "message.delete", _id);
                sendToSocket(toM.replace("$", ""),  "message.delete", _id);
            }else{
                sendToChatUsers(toM, "message.delete", _id);
            }
        }catch(e){
            socket.logError(e);
        }
    });

    socket.ontimeout("message.fetch", 300, async (to, chnl, start, end) => {
        try{
            if(!socket.user) return socket.emit("error", "not auth");

            if(!valid.id(to))                           return socket.emit("error.valid", "message.fetch", "to");
            if(!valid.idOrSpecyficStr(chnl, ["main"]))  return socket.emit("error.valid", "message.fetch", "chnl");
            if(!valid.num(start, 0))                    return socket.emit("error.valid", "message.fetch", "start");
            if(!valid.num(end, 0))                      return socket.emit("error.valid", "message.fetch", "end");

            let privChat = to.startsWith("$");
            if(privChat){
                const p1 = socket.user._id;
                const p2 = to.replace("$", "");
                to = chatMgmt.combinateId(p1, p2);
            }

            if(!privChat){
                const perm = await getChnlPerm(socket.user._id, to, chnl);
                if(!perm.visable) return socket.emit("error", "channel is not exist");
            }

            const responeAll = await global.db.mess.find(to, { chnl }, { reverse: true, max: end+start });
            const respone = responeAll.slice(start, end);

            socket.emit("message.fetch", respone);
        }catch(e){
            socket.logError(e);
        }
    });

    socket.ontimeout("message.markAsRead", 100, async (to, chnl, mess_id) => {
        try{
            if(!socket.user) return socket.emit("error", "not auth");

            if(!valid.id(to)) return socket.emit("error.valid", "message.markAsRead", "to");
            if(!valid.idOrSpecyficStr(chnl, ["main"]))      return socket.emit("error.valid", "message.markAsRead", "chnl");
            if(!valid.idOrSpecyficStr(mess_id, ["last"]))   return socket.emit("error.valid", "message.markAsRead", "mess_id");

            const firendChat = to.startsWith("$");
            
            const search = {};
            if(firendChat) search.priv = to.replace("$", "");
            else search.group = to;

            if(mess_id == "last"){
                let toM = to;
                if(firendChat){
                    const p1 = socket.user._id;
                    const p2 = to.replace("$", "");
                    toM = chatMgmt.combinateId(p1, p2);
                }
                const lastIdMess = await global.db.mess.find(toM, { chnl }, { reverse: true, max: 1 });
                if(lastIdMess.length == 0) return;

                mess_id = lastIdMess[0]._id;
                socket.emit("message.markAsRead", to, chnl, mess_id);
            }

            await global.db.userDatas.updateOne(socket.user._id, search, (data) => {
                if(!data.last) data.last = {};
                data.last[chnl] = mess_id;
                return data;
            });
        }catch(e){
            socket.logError(e);
        }
    });

    socket.ontimeout("message.react", 100, async (server, msgId, react) => {
        try{
            if(!socket.user) return socket.emit("error", "not auth");
            
            if(!valid.id(server.replace("$", ""))) return socket.emit("error.valid", "message.react", "server");
            if(!valid.id(msgId)) return socket.emit("error.valid", "message.react", "msgId");
            if(!valid.str(react, 0, 30)) return socket.emit("error.valid", "message.react", "react");
        
            let toM = server;
            if(server.startsWith("$")){
                const p1 = socket.user._id;
                const p2 = server.replace("$", "");
                toM = chatMgmt.combinateId(p1, p2);
            }
            const msg = await global.db.mess.findOne(toM, { _id: msgId });
            if(!msg) return socket.emit("error", "msg does not exist");

            const reacts = msg.reacts || {};
            if(!reacts[react]) reacts[react] = [];
            
            if(reacts[react].includes(socket.user._id)){
                reacts[react] = reacts[react].filter(id => id != socket.user._id);
                if(reacts[react].length == 0) delete reacts[react];
            }else{
                reacts[react].push(socket.user._id);
            }

            await global.db.mess.updateOne(toM, { _id: msgId }, { reacts });

            if(server.startsWith("$")){
                global.sendToSocket(socket.user._id, "message.react", socket.user._id, server, msgId, react);
                global.sendToSocket(server.replace("$", ""), "message.react", socket.user._id, "$"+socket.user._id, msgId, react);
            }else{
                global.sendToChatUsers(server, "message.react", socket.user._id, server, msgId, react);
            }
        }catch(e){
            socket.logError(e);
        }
    });

    socket.ontimeout("message.search", 1000, async (server, chnl, query) => {
        try{
            if(!socket.user) return socket.emit("error", "not auth");
            if(!valid.id(server)) return socket.emit("error.valid", "message.search", "server");
            if(!valid.idOrSpecyficStr(chnl, ["main"])) return socket.emit("error.valid", "message.search", "chnl");
            if(!validShema.messageSearch(query))
                return socket.emit("error.valid", "message.search", "search", validShema.messageSearch.errors);

            const priv = server.startsWith("$");
            if(priv){
                const p1 = socket.user._id;
                const p2 = server.replace("$", "");
                server = chatMgmt.combinateId(p1, p2);
            }

            const results = await global.db.mess.find(server, (data) => {
                if(data.chnl != chnl) return false;
                return filterMessages(query, data);
            });

            socket.emit("message.search", results);
        }catch(e){
            socket.logError(e);
        }
    })
}

global.getChnlPerm = async function(user, server, chnl){
    const permission = new permissionSystem(server);
    const channel = await global.db.groupSettings.findOne(server, c => c.chid == chnl);
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