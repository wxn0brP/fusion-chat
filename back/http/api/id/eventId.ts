import { Router } from "@wxn0brp/falcon-frame";
import db from "#db";
import valid from "#logic/validData";
import { combineId } from "#logic/chatMgmt";
import Id from "#id";
import InternalCode from "#codes";
import getCacheSettings from "#logic/cacheSettings";
import { AnotherCache } from "@wxn0brp/ac";

const router = new Router();
const cache = new AnotherCache(getCacheSettings("EventId"));

router.get("/id/event", async (req, res) => {
	const { id } = req.query as { id: Id };
	if (!valid.id(id))
		return res.json({
			err: true,
			c: InternalCode.UserError.Express.MissingParameters,
			msg: "event",
		});

	let name = cache.get(id);
	if (!name) {
		const data = await db.realmData.findOne(
			"announcement.channels",
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

		const chnl = await db.realmConf.findOne<any>(data.tr, { chid: data.tc });
		if (!chnl)
			return res.json({
				err: true,
				c: InternalCode.UserError.Express.EventId_NotFound,
				msg: "event not found",
			});

		const realmName = await db.realmConf
			.findOne<any>(data.tr, { _id: "set" })
			.then(({ name }) => name);
		name = realmName + " > " + chnl.name;
		cache.set(id, name);
	}

	res.json({ err: false, name });
});

export default router;
