import { Router } from "express";
import valid from "../../logic/validData.js";
const router = Router();

router.get("/userId", async (req, res) => {
    const { id, chat } = req.query;
    if(!valid.id(id)) return res.json({ err: true, msg: "id is not valid" });
    if(chat && !valid.id(chat)) return res.json({ err: true, msg: "chat is not valid" });

    if(chat){
        const userData = await global.db.groupData.findOne(chat, { uid: id });
        if(userData) return res.json({ err: false, name: userData.name });
    }

    const user = await global.db.data.findOne("user", { _id: id });
    if(!user) return res.json({ err: true, msg: "user is not found" });

    const nickData = await global.db.userDatas.findOne(id, { $exists: { nick: true }});
    if(nickData) return res.json({ err: false, name: nickData.nick });

    return res.json({ err: false, name: user.name });
});

export default router;