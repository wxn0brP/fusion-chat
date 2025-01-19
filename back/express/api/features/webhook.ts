import { Router } from "express";
import { handleCustom } from "../../../logic/webhooks/index";
import valid from "../../../logic/validData";
import Logic_Webhook from "../../../types/logic/webhook";
const router = Router();

router.post("/custom", async (req, res) => {
    const { query, body } = req as { query: object, body: object };
    const queryData = query as Logic_Webhook.webhook_query;

    if(!valid.str(queryData.token)) return res.status(400).send("Token is required");

    const { code, msg } = await handleCustom(queryData, body);
    res.status(code).send(msg);
});


const exportRouter = Router();
exportRouter.use("/webhook", router);
export default exportRouter;