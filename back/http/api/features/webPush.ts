import InternalCode from "#codes";
import db from "#db";
import { cache, getTokenFromPointer } from "#logic/mobileNotif";
import { Router } from "@wxn0brp/falcon-frame";

export const webPushRouter = new Router();

webPushRouter.post("/webPush", async (req, res) => {
	const { fcToken, sub } = req.body;

	if (!fcToken)
		return res.json({
			err: true,
			c: InternalCode.UserError.Express.MissingParameters,
			msg: "fcToken",
		});

	if (!sub)
		return res.json({
			err: true,
			c: InternalCode.UserError.Express.MissingParameters,
			msg: "sub",
		});

	const userToken = await getTokenFromPointer(fcToken);
	if (!userToken)
		return res.json({
			err: true,
			c: InternalCode.UserError.Express.FireToken_InvalidFcToken,
			msg: "invalid fcToken",
		});

	const pairIsset = await db.data.c("webPush").findOne({
		u: userToken.user,
		sub,
	});
	if (pairIsset) return res.json({ err: false, msg: "ok" });

	await db.data.c("webPush").removeOne({ sub }); // remove if token is registered for another user

	await db.data.c("webPush").add(
		{
			sub,
			u: userToken.user,
		}
	);

	cache.delete(fcToken);
	res.json({ err: false, msg: "ok" });
});
