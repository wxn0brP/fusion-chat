import InternalCode from "#codes";
import db from "#db";
import { Id } from "#id";
import valid from "#logic/validData";
import { RouteHandler } from "@wxn0brp/falcon-frame";

export const userIdRoute: RouteHandler = async (req, res) => {
	const { id, chat } = req.query as { id: Id; chat?: Id };
	if (!valid.id(id))
		return res.json({
			err: true,
			c: InternalCode.UserError.Express.MissingParameters,
			msg: "id",
		});
	if (chat && !valid.id(chat))
		return res.json({
			err: true,
			c: InternalCode.UserError.Express.MissingParameters,
			msg: "chat",
		});

	if (chat) {
		const userData = await db.realmData.c(chat).findOne({ uid: id });
		if (userData)
			return res.json({ err: false, name: userData.name, c: 1 });
	}

	const user = await db.data.c("user").findOne({ _id: id });
	if (!user) {
		const rm = await db.data.c("rm").findOne({ _id: id });
		if (rm)
			return res.json({ err: false, name: "Deleted User " + id, c: -1 });
		return res.json({
			err: true,
			c: InternalCode.UserError.Express.UserId_NotFound,
			msg: "user is not found",
		});
	}

	const nickData = await db.userData.c(id).findOne({
		$exists: { nick: true },
	});
	if (nickData) return res.json({ err: false, name: nickData.nick, c: 0 });

	return res.json({ err: false, name: user.name, c: 0 });
}
