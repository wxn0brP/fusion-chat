import { Router } from "express";
import valid from "../../../logic/validData";
import db from "../../../dataBase";
import { Id } from "../../../types/base";
const router = Router();

router.get("/id/bot", async (req, res) => {
    const { id, chat } = req.query as { id: Id, chat?: Id };
    if(!valid.id(id)) return res.json({ err: true, msg: "bot is not valid" });
    if(chat && !valid.id(chat)) return res.json({ err: true, msg: "chat is not valid" });

    if(chat){
        const botNick = await db.realmData.findOne(chat, { bid: id });
        if(botNick) return res.json({ err: false, name: botNick.name });
    }

    const bot = await db.botData.findOne(id, { _id: "name" });
    if(!bot){
        const rm = await db.data.findOne("rm", { _id: id });
        if(rm)
            return res.json({ err: false, name: "Deleted Bot "+id });
        return res.json({ err: true, msg: "bot is not found" });
    }

    res.json({ err: false, name: bot.name });
});

export default router;