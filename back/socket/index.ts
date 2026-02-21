import db from "#db";
import Db_RealmUser from "#types/db/realmUser";
import "./bot";
import "./chat";
import "./dev-panel";
import "./qrCodeLogin";
import { io } from "./server";

export async function sendToRealmUsers(realm: string, channel: string, ...args: any[]) {
	const users = await db.realmUser.c<Db_RealmUser.data>(realm).find({});
	for (const user of users) {
		const room = "bot" in user ?
			"bot-" + user.bot :
			"user-" + user.u;
		io.room(room).emit(channel, ...args);
	}
};

export async function sendToUser(id: string, event: string, ...args: any[]) {
	io.room("user-" + id).emit(event, ...args);
}

// socketIoMiddleware
