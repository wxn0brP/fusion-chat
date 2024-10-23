import { Router } from 'express';
import { group_join } from '../../socket/chat/logic/chats.js';
const router = Router();

router.get("/joinGrupMeta", global.authenticateMiddleware, async (req, res) => {
    const { id } = req.query;
    if(!id) return res.json({ err: true, msg: "id is required" });

    const userExists = await global.db.userDatas.findOne(req.user, { group: id });
    if(userExists) return res.json({ err: false, state: 1 });

    const isBaned = await global.db.usersPerms.findOne(id, { ban: req.user });
    if(isBaned) return res.json({ err: false, state: 2 });

    const groupRes = {};

    const groupMeta = await global.db.groupSettings.findOne(id, { _id: "set" });
    groupRes.name = groupMeta.name;
    groupRes.img = groupMeta.img || false;

    res.json({ err: false, state: 0, data: groupRes });
});

router.get("/joinGrup", global.authenticateMiddleware, async (req, res) => {
    const { id } = req.query;
    const { err } = await group_join({ _id: req.user }, id);
    if(err){
        if(err[0] == "valid.error") return res.status(400).json({ err: true, msg: err[2] });
        else return res.json({ err: true, msg: err.slice(2) });
    }

    res.json({ err: false, msg: "ok" });
});

export default router;