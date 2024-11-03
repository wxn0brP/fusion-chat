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

    const userServers = await global.db.userDatas.find(req.user, (g) => !!g.group);
    const botServers = await global.db.botData.find(id, { $exists: { server: true }}).then(b => b.map(s => s.server));
    const availableServers = userServers.filter(s => !botServers.includes(s.group)).map(s => s.group);
    botRes.servers = availableServers;

    res.json({ err: false, state: 0, data: botRes });
});

router.get("/botInvite", global.authenticateMiddleware, async (req, res) => {
    const { id, server } = req.query;
    const { err, msg } = await invite(req.user, id, server);

    res.json({ err, msg });
});

export default router;