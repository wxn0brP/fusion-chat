import InternalCode from "#codes";
import db from "#db";
import { Id } from "#id";
import valid from "#logic/validData";
import { RouteHandler } from "@wxn0brp/falcon-frame";

export const webhookIdRoute: RouteHandler = async (req, res) => {
	const { id, chat } = req.query as { id: Id; chat: Id };
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

	const webhook = await db.realmConf.findOne<any>(chat, { whid: id });
	if (!webhook) {
		const rm = await db.data.findOne("rm", { _id: id });
		if (rm) return res.json({ err: false, name: "Deleted Webhook " + id });
		return res.json({
			err: true,
			c: InternalCode.UserError.Express.WebhookId_NotFound,
			msg: "webhook is not found",
		});
	}

	res.json({ err: false, name: webhook.name });
}