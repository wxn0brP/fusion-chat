import { Router } from "express";
import valid from "../../../logic/validData.js";
import db from "../../../dataBase.js";
const router = Router();

router.get("/id/wh", async (req, res) => {
    const { id, chat } = req.query;
    if(!valid.id(id)) return res.json({ err: true, msg: "bot is not valid" });
    if(!valid.id(chat)) return res.json({ err: true, msg: "chat is not valid" });

    const webhook = await db.realmConf.findOne(chat, { whid: id });
    if(!webhook){
        const rm = await db.data.findOne("rm", { _id: id });
        if(rm)
            return res.json({ err: false, name: "Deleted Webhook "+id });
        return res.json({ err: true, msg: "webhook is not found" });
    }

    res.json({ err: false, name: webhook.name });
});

export default router;