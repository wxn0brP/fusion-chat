import InternalCode from "#codes";
import db from "#db";
import { Id } from "#id";
import valid from "#logic/validData";
import { RouteHandler } from "@wxn0brp/falcon-frame";

export const botIdRoute: RouteHandler = async (req, res) => {
	const { id, chat } = req.query as { id: Id; chat?: Id };
	if (!valid.id(id))
		return res.json({
			err: true,
			c: InternalCode.UserError.Express.MissingParameters,
			msg: "bot",
		});
	if (chat && !valid.id(chat))
		return res.json({
			err: true,
			c: InternalCode.UserError.Express.MissingParameters,
			msg: "chat",
		});

	if (chat) {
		const botNick = await db.realmData.c(chat).findOne({ bid: id });
		if (botNick) return res.json({ err: false, name: botNick.name });
	}

	const bot = await db.botData.c(id).findOne({ _id: "name" });
	if (!bot) {
		const rm = await db.data.c("rm").findOne({ _id: id });
		if (rm) return res.json({ err: false, name: "Deleted Bot " + id });
		return res.json({
			err: true,
			c: InternalCode.UserError.Express.BotId_BotNotFound,
			msg: "bot is not found",
		});
	}

	res.json({ err: false, name: bot.name });
}
