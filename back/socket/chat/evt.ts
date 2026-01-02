import { rm } from "fs";
import { rmCache as statusMgmtRmCache } from "#logic/status";
import db from "#db";
import { Id } from "#id";
import { GLSocket } from "@wxn0brp/gloves-link-server";
import { io } from "../server";
import { sendToUser } from "..";

export default (socket: GLSocket) => {
	const uid = socket.user._id;
	socket.on("disconnect", () => {
		const sockets = io.room("user-" + uid).size;
		if (sockets > 0) return;

		rm(`userFiles/${uid}`, { recursive: true, force: true }, (err) => {
			if (err) console.log(err);
		});
		statusMgmtRmCache(uid);

		updateFriendList(uid);
	});

	socket.on("logout", async (cb?: Function) => {
		// @ts-ignore
		const token = socket.handshake.auth.token;
		db.data.removeOne("token", { token });
		db.data.removeOne("fireToken", { fc: token });
		socket.user = null;
		if (cb) cb();
		setTimeout(() => {
			// @ts-ignore
			if (socket.connected) socket.disconnect();
		}, 100);
	});

	if (io.room("user-" + uid).size == 1) updateFriendList(uid);
};

async function updateFriendList(id: Id) {
	const friendsGraph = await db.dataGraph.find("friends", id);
	const friends = friendsGraph.map((f) => {
		if (f.a == id) return f.b;
		return f.a;
	});

	friends.forEach((f) => {
		sendToUser(f, "refreshData", "friend.get.all");
	});
}
