import { Router } from "express";
const router = Router();
import { invite } from "../../../logic/inviteBot";
import db from "../../../dataBase";
import { Id } from "../../../types/base";
import InternalCode from "../../../codes";

export const path = "iv/bot";

router.get("/", global.authenticateMiddleware, async (req, res) => {
    const { id, realm } = req.query as { id: Id, realm: Id };
    const { err, msg } = await invite(req.user, id, realm);

    res.json({ err, msg });
});

router.get("/meta", global.authenticateMiddleware, async (req, res) => {
    const { id } = req.query as { id: Id };
    if(!id) return res.json({ err: true, c: InternalCode.UserError.Express.MissingParameters, msg: "id" });

    const botExists = await db.botData.findOne(id, { _id: "owner" });
    if(!botExists) return res.json({ err: true, c: InternalCode.UserError.Express.BotInvite_NotFound, msg: "bot not found" });

    const botRes = {
        name: undefined,
        realms: undefined
    }
    
    botRes.name = await db.botData.findOne(id, { _id: "name" }).then(b => b.name);

    const userRealms = await db.userData.find(req.user, { $exists: { realm: true }});
    const botRealms = await db.botData.find(id, { $exists: { realm: true }}).then(b => b.map(r => r.realm));
    const availableRealms = userRealms.filter(s => !botRealms.includes(s.realm)).map(s => s.realm);
    botRes.realms = availableRealms;

    res.json({ err: false, data: botRes });
});

export default router;