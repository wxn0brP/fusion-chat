const sendMessage = require("../../logic/sendMessage");
const chatMgmt = require("../../logic/chatMgmt");
const valid = require("../../logic/validData");
const permissionSystem = require("../../logic/permission-system");
const { extractTimeFromId } = require("../../logic/utils");

const validShema = {
    messageSearch: valid.objAjv(require("./valid/messageSearch")),
};

module.exports = (socket) => {
    socket.ontimeout("mess", 200, async (req) => {
        try{
            const result = await sendMessage(req, socket.user);
            if(result.err) return socket.emit(...result.err);
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
    });

    socket.ontimeout("message.pin", 1000, async (server, chnl, msgId, pin) => {
       try{
           if(!socket.user) return socket.emit("error", "not auth");
           if(!valid.id(server)) return socket.emit("error.valid", "message.pin", "server");
           if(!valid.idOrSpecyficStr(chnl, ["main"])) return socket.emit("error.valid", "message.pin", "chnl");
           if(!valid.id(msgId)) return socket.emit("error.valid", "message.pin", "msgId");
           if(!valid.bool(pin)) return socket.emit("error.valid", "message.pin", "pin");
           
           const priv = server.startsWith("$");
           let chat = server;
           if(priv){
               const p1 = socket.user._id;
               const p2 = server.replace("$", "");
               chat = chatMgmt.combinateId(p1, p2);
           }

           await global.db.mess.updateOne(chat, { _id: msgId }, { pinned: pin });
           const refreshData = {
               evt: "message.fetch.pinned",
               server,
               chnl,
           }

           if(priv){
               global.sendToSocket(socket.user._id, "refreshData", refreshData, server, chnl);
               refreshData.server = "$"+socket.user._id;
               global.sendToSocket(server.replace("$", ""), "refreshData", refreshData, "$"+socket.user._id, chnl);
           }else{
               global.sendToChatUsers(server, "refreshData", refreshData, server, chnl);
           }
       }catch(e){
           socket.logError(e);
       }
    });

    socket.ontimeout("message.fetch.pinned", 1000, async (server, chnl) => {
        try{
            if(!socket.user) return socket.emit("error", "not auth");
            if(!valid.id(server)) return socket.emit("error.valid", "message.get.pinned", "server");
            if(!valid.idOrSpecyficStr(chnl, ["main"])) return socket.emit("error.valid", "message.get.pinned", "chnl");
            
            const priv = server.startsWith("$");
            if(priv){
                const p1 = socket.user._id;
                const p2 = server.replace("$", "");
                server = chatMgmt.combinateId(p1, p2);
            }

            const results = await global.db.mess.find(server, (data) => {
                if(data.chnl != chnl) return false;
                return data.pinned === true;
            });

            socket.emit("message.fetch.pinned", results);
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