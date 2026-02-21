import db from "#db";
import { Id } from "#id";

export default async (id: Id) => {
	await db.data.c("user").removeOne({ _id: id });
	await db.data.c("rm").add({ _id: id });
	await db.data.c("fireToken").removeOne({ user: id });

	const realms = await db.userData.c(id).find({
		$exists: { realm: true },
	});
	for (const realm of realms) {
		await db.realmUser.c(realm.realm).removeOne({ uid: id });
	}

	const bots = await db.userData.c(id).find({ $exists: { botID: true } });
	for (const bot of bots) {
		const botRealms = await db.botData.c(bot.botID).find({
			$exists: { realm: true },
		});
		for (const realm of botRealms) {
			await db.realmUser.c(realm.realm).removeOne({ bot: bot.botID });
		}
		await db.botData.removeCollection(bot.botID);
		await db.data.c("rm").add({ _id: bot.botID });
	}

	await db.userData.removeCollection(id);
};
