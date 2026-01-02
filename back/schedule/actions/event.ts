import { Id } from "#id";
import { activeTasks } from "../index";
import db from "#db";
import Db_RealmData from "#types/db/realmData";
import { sendToUser } from "../../socket";

export default async (data: { realm: Id; evt: Id }, taskId: Id) => {
	if (!activeTasks.has(taskId)) return;

	const users = await db.realmData.find<Pick<Db_RealmData.event_user, "u">>(
		data.realm,
		{ uevt: data.evt },
		{},
		{},
		{ select: ["u"] },
	);
	users.forEach(({ u }) => {
		sendToUser(u, "realm.event.notify", data.realm, data.evt);
	});
	// TODO add firebase notification
};
