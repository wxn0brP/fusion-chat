import { Server } from "socket.io";
global.io = new Server(global.server, {
    cors: {
        origin: ["localhost:1478", "ifp.ct8.pl"],
    },
});

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
    const chatUsers = await global.db.usersPerms.find(to, (r) => r.uid);
    chatUsers.forEach(user => {
        sendToSocket(user.uid, channel, ...args);
    });
}

await import("./chat/index.js");
await import("./qrCodeLogin.js");