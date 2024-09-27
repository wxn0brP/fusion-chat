import { Router } from "express";
import { handleCustom } from "../../logic/webhooks/index.js";
import valid from "../../logic/validData.js";
const router = Router();

router.post("/custom", async (req, res) => {
    const { query, body } = req;
    if(!valid.str(query.token)) return res.status(400).send("Token is required");

    const { code, msg } = await handleCustom(query, body);
    res.status(code).send(msg);
});


const exportRouter = Router();
exportRouter.use("/webhook", router);
export default exportRouter;