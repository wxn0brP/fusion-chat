import InternalCode from "#codes";
import db from "#db";
import { Id } from "#id";
import valid from "#logic/validData";
import ValidError from "#logic/validError";
import Db_BotData from "#types/db/botData";
import { Socket_StandardRes } from "#types/socket/res";
import { Socket_User } from "#types/socket/user";
import { genId } from "@wxn0brp/db";

export async function bots_get(
	suser: Socket_User,
): Promise<Socket_StandardRes> {
	const botsData = await db.userData.c(suser._id).find({
		$exists: { botID: true },
	});
	const botsID = botsData.map((b) => b.botID);
	const botsPromises = botsID.map(async (id) => {
		const bot = await db.botData.c<Db_BotData.name>(id).findOne({
			_id: "name",
		});
		return { id, name: bot.name };
	});

	const bots = await Promise.all(botsPromises);
	return { err: false, res: [bots] };
}

export async function bots_delete(
	suser: Socket_User,
	id: Id,
): Promise<Socket_StandardRes> {
	const validE = new ValidError("bots.delete");
	if (!valid.id(id)) return validE.valid("id");

	const botExists = await db.userData.c(suser._id).findOne({ botID: id });
	if (!botExists)
		return validE.err(InternalCode.UserError.Socket.DevPanel_BotNotFound);

	const realms = await db.botData.c<Db_BotData.realm>(id).find({
		$exists: { realm: true },
	});
	for (const realm of realms) {
		await db.realmUser.c(realm.realm).removeOne({ bot: id });
	}

	await db.userData.c(suser._id).removeOne({ botID: id });
	await db.botData.removeCollection(id);
	await db.data.c("rm").add({ _id: id });

	return { err: false };
}

export async function bots_create(
	suser: Socket_User,
	name: string,
): Promise<Socket_StandardRes> {
	const validE = new ValidError("bots.create");
	if (!valid.str(name, 0, 30)) return validE.valid("name");

	const id = genId();
	await db.userData.c(suser._id).add({ botID: id }, false);

	await db.botData.ensureCollection(id);
	await db.botData.c(id).add({ _id: "owner", owner: suser._id }, false);
	await db.botData.c(id).add({ _id: "name", name }, false);

	return { err: false, res: [id] };
}
