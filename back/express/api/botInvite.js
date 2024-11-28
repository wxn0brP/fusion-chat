import { Router } from "express";
const router = Router();
import { invite } from "../../logic/inviteBot.js";

router.get("/botInviteMeta", global.authenticateMiddleware, async (req, res) => {
    const { id } = req.query;
    if(!id) return res.json({ err: true, msg: "id is required" });

    const botExists = await global.db.botData.findOne(id, { _id: "owner" });
    if(!botExists) return res.json({ err: true, msg: "bot not found" });

    const botRes = {};
    botRes.name = await global.db.botData.findOne(id, { _id: "name" }).then(b => b.name);

    const userRealms = await global.db.userData.find(req.user, { $exists: { realm: true }});
    const botRealms = await global.db.botData.find(id, { $exists: { server: true }}).then(b => b.map(s => s.server));
    const availableServers = userRealms.filter(s => !botRealms.includes(s.realm)).map(s => s.realm);
    botRes.realms = availableServers;

    res.json({ err: false, state: 0, data: botRes });
});

router.get("/botInvite", global.authenticateMiddleware, async (req, res) => {
    const { id, server } = req.query;
    const { err, msg } = await invite(req.user, id, server);

    res.json({ err, msg });
});

export default router;