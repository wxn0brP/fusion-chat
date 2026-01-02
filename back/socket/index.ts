import db from "#db";
import Db_RealmUser from "#types/db/realmUser";
import { GlovesLinkServer, GLSocket } from "@wxn0brp/gloves-link-server";

globalThis.io = new GlovesLinkServer({
	server: globalThis.server,
});

globalThis.getSocket = (to, room = "") => {
	// const namespace = globalThis.io.of("/" + room);
	// const namespace = globalThis.io.rooms.get(room);
	// const sockets: GLSocket[] = Array.from(namespace.sockets.values());

	// return sockets.filter((socket) => socket.user._id === to);
	return globalThis.io.room(to).sockets
};

globalThis.sendToSocket = (id, channel, ...args) => {
	let sockets = global.getSocket(id);
	sockets.forEach((socket) => {
		socket.emit(channel, ...args);
	});
};

globalThis.sendToChatUsers = async (to, channel, ...args) => {
	const users = await db.realmUser.find<Db_RealmUser.data>(to, {});
	for (const user of users) {
		if ("bot" in user) {
			global.getSocket(user.bot, "bot").forEach((conn) => {
				conn.emit(channel, ...args);
			});
		} else {
			global.sendToSocket(user.u, channel, ...args);
		}
	}
};

// global.io.use(socketIoMiddleware);

await import("./chat/index.js");
// await import("./bot/index.js");
// await import("./dev-panel/index.js");
// await import("./qrCodeLogin.js");
