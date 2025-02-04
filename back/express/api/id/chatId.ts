import { Router } from "express";
import db from "../../../dataBase";
import { Id } from "../../../types/base";
import InternalCode from "../../../codes";
const router = Router();

router.get("/id/chat", async (req, res) => {
    const { chat } = req.query as { chat: Id };
    if(!chat) return res.json({ err: true, c: InternalCode.UserError.Express.MissingParameters, msg: "chat" });

    const chatI = await db.realmConf.findOne(chat, { _id: "set" });
    if(!chatI){
        const rm = await db.data.findOne("rm", { _id: chat });
        if(rm)
            return res.json({ err: false, name: "Deleted Chat "+chat });
        return res.json({ err: true, c: InternalCode.UserError.Express.ChatId_NotFound, msg: "chatId is not found" });
    }
        

    res.json({ err: false, name: chatI.name });
});

export default router;