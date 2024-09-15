const Router = require("express").Router;
const router = Router();
const webhooks = require("../../logic/webhooks");
const valid = require("../../logic/validData");

router.post("/custom", async (req, res) => {
    const { query, body } = req;

    if(!valid.id(query.id)) return res.status(400).send("Invalid webhook id");
    if(!valid.id(query.chat)) return res.status(400).send("Invalid webhook chat id");
    if(!valid.id(query.chnl)) return res.status(400).send("Invalid webhook chnl id");

    const { code, msg } = await webhooks.handleCustom(query, body);
    
    res.status(code).send(msg);
});


const exportRouter = Router();
exportRouter.use("/webhook", router);
module.exports = exportRouter;