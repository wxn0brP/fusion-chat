import { Router } from 'express';
import { realm_join } from '../../socket/chat/logic/chats.js';
const router = Router();

router.get("/joinGrupMeta", global.authenticateMiddleware, async (req, res) => {
    const { id } = req.query;
    if(!id) return res.json({ err: true, msg: "id is required" });

    const userExists = await global.db.userData.findOne(req.user, { realm: id });
    if(userExists) return res.json({ err: false, state: 1 });

    const isBaned = await global.db.realmData.findOne(id, { ban: req.user });
    if(isBaned) return res.json({ err: false, state: 2 });

    const realmRes = {};

    const realmMeta = await global.db.realmConf.findOne(id, { _id: "set" });
    realmRes.name = realmMeta.name;
    realmRes.img = realmMeta.img || false;

    res.json({ err: false, state: 0, data: realmRes });
});

router.get("/joinGrup", global.authenticateMiddleware, async (req, res) => {
    const { id } = req.query;
    const { err } = await realm_join({ _id: req.user }, id);
    if(err){
        if(err[0] == "valid.error") return res.status(400).json({ err: true, msg: err[2] });
        else return res.json({ err: true, msg: err.slice(2) });
    }

    res.json({ err: false, msg: "ok" });
});

export default router;