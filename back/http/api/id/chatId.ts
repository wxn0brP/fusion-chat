import InternalCode from "#codes";
import db from "#db";
import { Id } from "#id";
import { RouteHandler } from "@wxn0brp/falcon-frame";

export const chatIdRoute: RouteHandler = async (req, res) => {
	const { chat } = req.query as { chat: Id };
	if (!chat)
		return res.json({
			err: true,
			c: InternalCode.UserError.Express.MissingParameters,
			msg: "chat",
		});

	const chatI = await db.realmConf.c(chat).findOne({ _id: "set" });
	if (!chatI) {
		const rm = await db.data.c("rm").findOne({ _id: chat });
		if (rm) return res.json({ err: false, name: "Deleted Chat " + chat });
		return res.json({
			err: true,
			c: InternalCode.UserError.Express.ChatId_NotFound,
			msg: "chatId is not found",
		});
	}

	res.json({ err: false, name: chatI.name });
}
