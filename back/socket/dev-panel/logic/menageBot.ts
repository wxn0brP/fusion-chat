import InternalCode from "#codes";
import db from "#db";
import { Id } from "#id";
import { create, KeyIndex } from "#logic/token/index";
import valid from "#logic/validData";
import ValidError from "#logic/validError";
import Db_UserData from "#types/db/userData";
import { Socket_StandardRes } from "#types/socket/res";
import { Socket_User } from "#types/socket/user";
import { genId } from "@wxn0brp/db";
import { infoSchema } from "../valid/edit";
import Socket_Bot from "#types/socket/dev-panel/bot";
import Db_BotData from "#types/db/botData";
import getCacheSettings from "#logic/cacheSettings";
import fs from "fs";
import { AnotherCache } from "@wxn0brp/ac";
const editInfoSchemat = valid.objAjv(infoSchema);

const cache = new AnotherCache<Id[]>(getCacheSettings("BotEdit"));

export async function canUserEditBot(
	suser: Socket_User,
	id: Id,
): Promise<boolean> {
	if (cache.has(suser._id)) {
		return cache.get(suser._id).includes(id);
	}

	const bots = await db.userData
		.c<Db_UserData.bot>(suser._id)
		.find({
			$exists: { botID: true },
		})
		.then((b) => b.map((b) => b.botID));
	cache.set(suser._id, bots);
	return bots.includes(id);
}

export async function bot_edit(
	suser: Socket_User,
	id: Id,
	info: Socket_Bot.edit__Info,
): Promise<Socket_StandardRes> {
	const validE = new ValidError("bot.edit");
	if (!valid.id(id)) return validE.valid("id");
	if (!editInfoSchemat(info)) return validE.valid("info");

	const canEdit = await canUserEditBot(suser, id);
	if (!canEdit)
		return validE.err(InternalCode.UserError.Socket.DevPanel_BotNotFound);

	const perm = await db.userData.c<Db_UserData.bot>(suser._id).findOne({
		botID: id,
	});
	if (!perm)
		return validE.err(InternalCode.UserError.Socket.DevPanel_BotNotFound);

	await db.botData.c(id).updateOne({ _id: "name" }, { name: info.name });

	return { err: false };
}

export async function bot_get_realms(
	suser: Socket_User,
	id: Id,
): Promise<Socket_StandardRes> {
	const validE = new ValidError("bot.get.realms");
	if (!valid.id(id)) return validE.valid("id");

	const canEdit = await canUserEditBot(suser, id);
	if (!canEdit)
		return validE.err(InternalCode.UserError.Socket.DevPanel_BotNotFound);

	const realms = await db.botData.c<Db_BotData.realm>(id).find({
		$exists: { realm: true },
	});
	const res = realms.map((r) => r.realm);
	return { err: false, res: [res] };
}

export async function bot_realm_exit(
	suser: Socket_User,
	id: Id,
	realm: Id,
): Promise<Socket_StandardRes> {
	const validE = new ValidError("bot.realm.exit");
	if (!valid.id(id)) return validE.valid("id");
	if (!valid.id(realm)) return validE.valid("realm");

	const canEdit = await canUserEditBot(suser, id);
	if (!canEdit)
		return validE.err(InternalCode.UserError.Socket.DevPanel_BotNotFound);

	const bot = await db.botData.c<Db_BotData.realm>(id).findOne({ realm });
	if (!bot)
		return validE.err(InternalCode.UserError.Socket.DevPanel_BotNotFound);

	await db.realmUser.c(realm).removeOne({ bot: id });
	await db.botData.c(id).removeOne({ realm });
	return { err: false };
}

export async function bot_generate_token(
	suser: Socket_User,
	id: Id,
): Promise<Socket_StandardRes> {
	const validE = new ValidError("bot.generate.token");
	if (!valid.id(id)) return validE.valid("id");

	const canEdit = await canUserEditBot(suser, id);
	if (!canEdit)
		return validE.err(InternalCode.UserError.Socket.DevPanel_BotNotFound);

	const payload = {
		rand: genId(),
		_id: id,
	};
	const token = await create(payload, false, KeyIndex.BOT_TOKEN);
	await db.botData.c(id).updateOneOrAdd({ _id: "token" }, { token });
	return { err: false, res: [token] };
}

export async function bot_profile_remove(
	suser: Socket_User,
	id: Id,
): Promise<Socket_StandardRes> {
	const validE = new ValidError("bot.profile.remove");
	if (!valid.id(id)) return validE.valid("id");

	const canEdit = await canUserEditBot(suser, id);
	if (!canEdit)
		return validE.err(InternalCode.UserError.Socket.DevPanel_BotNotFound);

	await db.botData.c(id).removeOne({ _id: "img" });
	const path = "userFiles/profiles/" + id + ".png";
	if (fs.existsSync(path)) fs.unlinkSync(path);

	return { err: false };
}
