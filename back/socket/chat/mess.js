const chatMgmt = require("../../logic/chatMgmt");
const valid = require("../../logic/validData");
const permissionSystem = require("../../logic/permission-system");

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
            let { to, msg, chnl } = req;
            if(!to || !msg || !chnl) return socket.emit("error", "to & msg & chnl is required");
    
            if(
                !valid.str(to, 0, 30) || !valid.str(chnl, 0, 30) || !valid.str(msg, 0, 2000) || !msg
            ){
                return socket.emit("error", "invalid data");
            }
            
            let friendChat = to.startsWith("$");
            if(friendChat){
                const friendExists = await global.db.userDatas.findOne(socket.user._id, { priv: to.replace("$", "") });
                if(!friendExists) return socket.emit("error", "friend not found - getMess");

                let p1 = socket.user._id;
                let p2 = to.replace("$", "");
                to = chatMgmt.combinateId(p1, p2);
                await global.db.mess.checkFile(to);
            }else{
                if(!chatMgmt.chatExsists(to)) return socket.emit("error", "chat is not exists - getMess");
            }

            if(!friendChat){
                const perm = await getChnlPerm(socket.user._id, to, chnl); 
                if(!perm.visable) return socket.emit("error", "channel is not exists - getMess");
                if(!perm.text) return socket.emit("error", "not perm to write - getMess");
            }
    
            let message = msg.trim();
            if(msg.length > 500) return socket.emit("error", "msg is too long - getMess");
            
            let data = {
                fr: socket.user._id,
                msg: message,
                chnl,
            }
            if(req.enc) data.enc = req.enc;
            if(req.res) data.res = req.res;
    
            let _id = await global.db.mess.add(to, data);
    
            if(!friendChat) data.to = to;
            else data.to = "$"+socket.user._id;
            
            data._id = _id._id;
            if(req.silent) data.silent = silent;
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
    
            if(!friendChat){
                data.toM = to;
                let chat = await global.db.usersPerms.find(to, r => r.uid);
                const server = (await global.db.groupSettings.findOne(to, { _id: "set"}));
                const title = "(S) " + server.name;

                chat.forEach(u => {
                    u = u.uid;
                    if(u == socket.user._id) return;
                    sendToSocket(u, "mess", data);
                    global.fireBaseMessage.newMsgInfo(title, u, data);
                })
            }else{
                let toSend = req.to.replace("$","");
                // const blocked = (await global.db.userDatas.findOne(toSend, { priv: socket.user._id })).block == true;
                // if(blocked) return;

                data.toM = socket.user._id;
                sendToSocket(toSend, "mess", data);

                const user = await global.db.data.findOne("user", { _id: socket.user._id });
                global.fireBaseMessage.newMsgInfo(user.name, toSend, data);
            }
        }catch(e){
            socket.logError(e);
        }
    });

    socket.ontimeout("editMess", 1000, async (toM, _id, msg) => {
        try{
            if(!socket.user) return socket.emit("error", "not auth");
            if(!valid.str(toM, 0, 30) || !valid.str(_id, 0, 30) || !valid.str(msg, 0, 500)){
                return socket.emit("error", "valid data");
            }

            const friendChat = toM.startsWith("$");
            let to = toM;
            if(friendChat){
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

            if(friendChat){
                sendToSocket(socket.user._id,       "editMess", _id, msg, time);
                sendToSocket(toM.replace("$", ""),  "editMess", _id, msg, time);
            }else{
                sendToChatUsers(toM, "editMess", _id, msg, time);
            }
        }catch(e){
            socket.logError(e);
        }
    });
    
    socket.ontimeout("deleteMess", 1000, async (toM, _id) => {
        try{
            if(!socket.user) return socket.emit("error", "not auth");
            
            if(!valid.str(toM, 0, 30) || !valid.str(_id, 0, 30)){
                return socket.emit("error", "valid data");
            }

            const friendChat = toM.startsWith("$");
            let to = toM;
            if(friendChat){
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
            if(friendChat){
                sendToSocket(socket.user._id,       "deleteMess", _id);
                sendToSocket(toM.replace("$", ""),  "deleteMess", _id);
            }else{
                sendToChatUsers(toM, "deleteMess", _id);
            }
        }catch(e){
            socket.logError(e);
        }
    });

    socket.ontimeout("getMess", 300, async (to, chnl, start, end) => {
        try{
            if(!socket.user) return socket.emit("error", "not auth");

            if(
                !valid.str(to, 0, 30) ||
                !valid.str(chnl, 0, 30) ||
                !valid.num(start, 0) ||
                !valid.num(end, 0)
            ){
                return socket.emit("error", "valid data");
            }

            let friendChat = to.startsWith("$");
            if(friendChat){
                const p1 = socket.user._id;
                const p2 = to.replace("$", "");
                to = chatMgmt.combinateId(p1, p2);
            }

            if(!friendChat){
                const perm = await getChnlPerm(socket.user._id, to, chnl);
                if(!perm.visable) return socket.emit("error", "channel is not exist");
            }

            const responeAll = await global.db.mess.find(to, { chnl }, { reverse: true, max: end+start });
            const respone = responeAll.slice(start, end);

            socket.emit("getMess", respone);
        }catch(e){
            socket.logError(e);
        }
    });

    socket.ontimeout("markAsRead", 100, async (to, chnl, mess_id) => {
        try{
            if(!socket.user) return socket.emit("error", "not auth");
            if(!valid.str(to, 0, 30) || !valid.str(chnl, 0, 30) || !valid.str(mess_id, 0, 30)) return socket.emit("error", "valid data");

            // const chat = await global.db.mess.findOne(to, { chnl });
            // if(!chat) return socket.emit("error", "chat does not exist");

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
                socket.emit("markAsRead", to, chnl, mess_id);
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

    socket.ontimeout("reactToMess", 100, async (server, msgId, react) => {
        try{
            if(!socket.user) return socket.emit("error", "not auth");
            if(!valid.id(server.replace("$", "")) || !valid.id(msgId) || !valid.str(react, 0, 30)) return socket.emit("error", "valid data");
        
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
                global.sendToSocket(socket.user._id, "reactToMess", socket.user._id, server, msgId, react);
                global.sendToSocket(server.replace("$", ""), "reactToMess", socket.user._id, "$"+socket.user._id, msgId, react);
            }else{
                global.sendToChatUsers(server, "reactToMess", socket.user._id, server, msgId, react);
            }
        }catch(e){
            socket.logError(e);
        }
    });
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