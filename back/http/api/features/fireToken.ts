import InternalCode from "#codes";
import db from "#db";
import { cache, getTokenFromPointer } from "#logic/mobileNotif";
import { Router } from "@wxn0brp/falcon-frame";

export const fireTokenRouter = new Router();

fireTokenRouter.post("/fireToken", async (req, res) => {
	const { fcToken, fireToken } = req.body;
	if (!fcToken)
		return res.json({
			err: true,
			c: InternalCode.UserError.Express.MissingParameters,
			msg: "fcToken",
		});
	if (!fireToken)
		return res.json({
			err: true,
			c: InternalCode.UserError.Express.MissingParameters,
			msg: "fireToken",
		});

	const userToken = await getTokenFromPointer(fcToken);
	if (!userToken)
		return res.json({
			err: true,
			c: InternalCode.UserError.Express.FireToken_InvalidFcToken,
			msg: "invalid fcToken",
		});

	const pairIsset = await db.data.c("fireToken").findOne({
		fc: userToken.token,
		fire: fireToken,
	});
	if (pairIsset) return res.json({ err: false, msg: "ok" });

	await db.data.c("fireToken").removeOne({ fire: fireToken }); // remove if token is registered for another user

	await db.data.c("fireToken").add(
		{
			fc: userToken.token,
			fire: fireToken,
			user: userToken.user,
			exp: userToken.exp,
		},
		false,
	);

	cache.delete(fcToken);
	res.json({ err: false, msg: "ok" });
});
