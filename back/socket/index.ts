import { Server, Socket } from "socket.io";
import db from "../dataBase";
import { socketIoMiddleware } from "../bannedIp";
import Db_RealmUser from "../types/db/realmUser";
global.io = new Server(global.server);

global.getSocket = (to, room = "") => {
    const namespace = global.io.of("/" + room);
    const sockets: Socket[] = Array.from(namespace.sockets.values());
    
    return sockets.filter(socket => socket.user._id === to);
}

global.sendToSocket = (id, channel, ...args) => {
    let sockets = global.getSocket(id);
    sockets.forEach(socket => {
        socket.emit(channel, ...args);
    });
}

global.sendToChatUsers = async (to, channel, ...args) => {
    const users = await db.realmUser.find<Db_RealmUser.data>(to, {});
    for(const user of users){
        if('bot' in user){
            global.getSocket(user.bot, "bot").forEach(conn => {
                conn.emit(channel, ...args);
            });
        }else{
            global.sendToSocket(user.u, channel, ...args);
        }
    }
}

global.io.use(socketIoMiddleware);

await import("./chat/index.js");
await import("./bot/index.js");
await import("./dev-panel/index.js");
await import("./qrCodeLogin.js");