import { Router } from "express";
import { handleCustom } from "../../logic/webhooks/index.js";
import valid from "../../logic/validData.js";
const router = Router();

router.post("/custom", async (req, res) => {
    const { query, body } = req;

    if(!valid.id(query.id)) return res.status(400).send("Invalid webhook id");
    if(!valid.id(query.chat)) return res.status(400).send("Invalid webhook chat id");
    if(!valid.id(query.chnl)) return res.status(400).send("Invalid webhook chnl id");

    const { code, msg } = await handleCustom(query, body);
    
    res.status(code).send(msg);
});


const exportRouter = Router();
exportRouter.use("/webhook", router);
export default exportRouter;