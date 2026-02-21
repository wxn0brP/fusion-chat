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
		const token = socket.authData.token;
		db.data.c("token").removeOne({ token });
		db.data.c("fireToken").removeOne({ fc: token });
		socket.user = null;
		if (cb) cb();
		setTimeout(() => {
			try {
				socket.disconnect();
			} catch { }
		}, 100);
	});

	if (io.room("user-" + uid).size == 1) updateFriendList(uid);
};

async function updateFriendList(id: Id) {
	const friendsGraph = await db.dataGraph.c("friends").find({ $or: [{ a: id }, { b: id }] });
	const friends = friendsGraph.map((f) => {
		if (f.a == id) return f.b;
		return f.a;
	});

	friends.forEach((f) => {
		sendToUser(f, "refreshData", "friend.get.all");
	});
}
