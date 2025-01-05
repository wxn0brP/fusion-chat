import { Router } from "express";
import valid from "../../logic/validData.js";
const router = Router();

router.get("/id/u", async (req, res) => {
    const { id, chat } = req.query;
    if(!valid.id(id)) return res.json({ err: true, msg: "id is not valid" });
    if(chat && !valid.id(chat)) return res.json({ err: true, msg: "chat is not valid" });

    if(chat){
        const userData = await global.db.realmData.findOne(chat, { uid: id });
        if(userData) return res.json({ err: false, name: userData.name, c: 1 });
    }

    const user = await global.db.data.findOne("user", { _id: id });
    if(!user){
        const rm = await global.db.data.findOne("rm", { _id: id });
        if(rm)
            return res.json({ err: false, name: "Deleted User "+id, c: -1 });
        return res.json({ err: true, msg: "user is not found" });
    }

    const nickData = await global.db.userData.findOne(id, { $exists: { nick: true }});
    if(nickData) return res.json({ err: false, name: nickData.nick, c: 0 });

    return res.json({ err: false, name: user.name, c: 0 });
});

export default router;