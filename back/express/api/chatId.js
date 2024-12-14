import { Router } from "express";
const router = Router();

router.get("/id/chat", async (req, res) => {
    const { chat } = req.query;
    if(!chat) return res.json({ err: true, msg: "chatId is required" });

    const chatI = await global.db.realmConf.findOne(chat, { _id: "set" });
    if(!chatI){
        const rm = await global.db.data.findOne("rm", { _id: chat });
        if(rm)
            return res.json({ err: false, name: "Deleted Chat "+chat });
        return res.json({ err: true, msg: "chatId is not found" });
    }
        

    res.json({ err: false, name: chatI.name });
});

export default router;