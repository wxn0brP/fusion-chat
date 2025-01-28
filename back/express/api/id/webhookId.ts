import { Router } from "express";
import valid from "../../../logic/validData";
import db from "../../../dataBase";
import { Id } from "../../../types/base";
import InternalCode from "../../../codes";
const router = Router();

router.get("/id/wh", async (req, res) => {
    const { id, chat } = req.query as { id: Id, chat: Id };
    if(!valid.id(id)) return res.json({ err: true, c: InternalCode.UserError.Express.MissingParameters, msg: "id" });
    if(chat && !valid.id(chat)) return res.json({ err: true, c: InternalCode.UserError.Express.MissingParameters, msg: "chat" });

    const webhook = await db.realmConf.findOne(chat, { whid: id });
    if(!webhook){
        const rm = await db.data.findOne("rm", { _id: id });
        if(rm)
            return res.json({ err: false, name: "Deleted Webhook "+id });
        return res.json({ err: true, c: InternalCode.UserError.Express.WebhookId_NotFound, msg: "webhook is not found" });
    }

    res.json({ err: false, name: webhook.name });
});

export default router;