import valid from "#logic/validData";
import { handleCustom } from "#logic/webhooks/index";
import Logic_Webhook from "#types/logic/webhook";
import { Router } from "@wxn0brp/falcon-frame";

export const webhookRouter = new Router();

webhookRouter.post("/webhook/custom", async (req, res) => {
	const { query, body } = req as { query: object; body: object };
	const queryData = query as Logic_Webhook.webhook_query;

	if (!valid.str(queryData.token))
		return res.status(400).send("Token is required");

	const { code, msg } = await handleCustom(queryData, body);
	res.status(code).send(msg);
});