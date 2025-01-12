import { Server } from "socket.io";
import db from "../dataBase.js";
import { socketIoMiddleware } from "../bannedIp.js";
global.io = new Server(global.server);

global.getSocket = (to, room = "") => {
    const namespace = io.of("/" + room);
    const sockets = Array.from(namespace.sockets.values());
    
    return sockets.filter(socket => socket.user._id === to);
}

global.sendToSocket = (id, channel, ...args) => {
    let sockets = getSocket(id);
    sockets.forEach(socket => {
        socket.emit(channel, ...args);
    });
}

global.sendToChatUsers = async (to, channel, ...args) => {
    const users = await db.realmUser.find(to, {});
    for(const user of users){
        if(user.bot){
            getSocket(user.bot, "bot").forEach(conn => {
                conn.emit(channel, ...args);
            });
        }else{
            sendToSocket(user.u, channel, ...args);
        }
    }
}

io.use(socketIoMiddleware);

await import("./chat/index.js");
await import("./bot/index.js");
await import("./dev-panel/index.js");
await import("./qrCodeLogin.js");