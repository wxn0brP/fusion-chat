import { Id } from "#id";
import { db } from "../realmSettings/set/imports";
import Db_UserData from "#types/db/userData";
import Db_RealmUser from "#types/db/realmUser";
import { sendToUser } from "../../..";

async function emitUserStatusUpdate(id: Id, status: string, text: string) {
	const relation_users = new Map<Id, true>();

	const friends = await db.dataGraph.c("friends").find({ $or: [{ a: id }, { b: id }] });
	for (const f of friends) {
		relation_users.set(f.a, true);
		relation_users.set(f.b, true);
	}

	const realms = await db.userData.c<Db_UserData.realm>(id).find(
		{ $exists: { realm: true } },
		{},
		{ select: ["realm"] },
	);

	for (const realm of realms) {
		const users = await db.realmUser.c<Db_RealmUser.user>(realm.realm).find(
			{ $exists: { u: true } },
			{},
			{ select: ["u"] },
		);
		for (const user of users) {
			relation_users.set(user.u, true);
		}
	}

	const users = Array.from(relation_users.keys());

	for (const user of users) {
		sendToUser(user, "user.status.update", id, status, text);
	}
}

export default emitUserStatusUpdate;
