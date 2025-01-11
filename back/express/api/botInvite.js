import { Router } from "express";
const router = Router();
import { invite } from "../../logic/inviteBot.js";
import db from "../../dataBase.js";

export const path = "iv/bot";

router.get("/", global.authenticateMiddleware, async (req, res) => {
    const { id, realm } = req.query;
    const { err, msg } = await invite(req.user, id, realm);

    res.json({ err, msg });
});

router.get("/meta", global.authenticateMiddleware, async (req, res) => {
    const { id } = req.query;
    if(!id) return res.json({ err: true, msg: "id is required" });

    const botExists = await db.botData.findOne(id, { _id: "owner" });
    if(!botExists) return res.json({ err: true, msg: "bot not found" });

    const botRes = {};
    botRes.name = await db.botData.findOne(id, { _id: "name" }).then(b => b.name);

    const userRealms = await db.userData.find(req.user, { $exists: { realm: true }});
    const botRealms = await db.botData.find(id, { $exists: { realm: true }}).then(b => b.map(r => r.realm));
    const availableRealms = userRealms.filter(s => !botRealms.includes(s.realm)).map(s => s.realm);
    botRes.realms = availableRealms;

    res.json({ err: false, data: botRes });
});

export default router;