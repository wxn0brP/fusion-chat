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
    const chatUsersPromise = global.db.usersPerms.find(to, (r) => r.uid)
        .then(chatUsers => {
            chatUsers.forEach(user => {
                sendToSocket(user.uid, channel, ...args);
            });
        });

    const botUsersPromise = global.db.usersPerms.find(to, (r) => r.bot)
        .then(botUsers => {
            botUsers.forEach(user => {
                getSocket(user.bot, "bot").forEach(conn => {
                    conn.emit(channel, ...args);
                });
            });
        });

    await Promise.all([chatUsersPromise, botUsersPromise]);
}

await import("./chat/index.js");
await import("./bot/index.js");
await import("./dev-panel/index.js");
await import("./qrCodeLogin.js");