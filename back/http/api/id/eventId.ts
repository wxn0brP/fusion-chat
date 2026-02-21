import InternalCode from "#codes";
import db from "#db";
import { Id } from "#id";
import getCacheSettings from "#logic/cacheSettings";
import { combineId } from "#logic/chatMgmt";
import valid from "#logic/validData";
import { AnotherCache } from "@wxn0brp/ac";
import { RouteHandler } from "@wxn0brp/falcon-frame";

const cache = new AnotherCache(getCacheSettings("EventId"));

export const eventIdRoute: RouteHandler = async (req, res) => {
	const { id } = req.query as { id: Id };
	if (!valid.id(id))
		return res.json({
			err: true,
			c: InternalCode.UserError.Express.MissingParameters,
			msg: "event",
		});

	let name = cache.get(id);
	if (!name) {
		const data = await db.realmData.c("announcement.channels").findOne(
			(data, ctx) => {
				const { tr, tc } = data;
				return ctx.combineId(tr, tc) == ctx.id;
			},
			{},
			{ id, combineId: combineId },
		);

		if (!data)
			return res.json({
				err: true,
				c: InternalCode.UserError.Express.EventId_NotFound,
				msg: "event not found",
			});

		const chnl = await db.realmConf.c(data.tr).findOne({ chid: data.tc });
		if (!chnl)
			return res.json({
				err: true,
				c: InternalCode.UserError.Express.EventId_NotFound,
				msg: "event not found",
			});

		const realmName = await db.realmConf.c(data.tr).findOne({ _id: "set" })
			.then(({ name }) => name);
		name = realmName + " > " + chnl.name;
		cache.set(id, name);
	}

	res.json({ err: false, name });
}
