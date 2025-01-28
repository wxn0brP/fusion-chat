import { Router } from "express";
import { realm_join } from "../../../socket/chat/logic/chats";
import db from "../../../dataBase";
import Db_RealmConf from "../../../types/db/realmConf";
import { Id } from "../../../types/base";
import { Socket_StandardRes_Error } from "../../../types/socket/res";
import { Socket_User } from "../../../types/socket/user";
import InternalCode from "../../../codes";
const router = Router();

export const path = "realm/join";

router.get("/meta", global.authenticateMiddleware, async (req, res) => {
    const { id } = req.query as { id: Id };
    if(!id) return res.json({ err: true, c: InternalCode.UserError.Express.MissingParameters, msg: "id" });

    const userExists = await db.userData.findOne(req.user, { realm: id });
    if(userExists) return res.json({ err: false, state: 1 });

    const isBaned = await db.realmData.findOne(id, { ban: req.user });
    if(isBaned) return res.json({ err: false, state: 2 });

    const realmRes = {
        name: undefined,
        img: undefined
    };

    const realmMeta = await db.realmConf.findOne<Db_RealmConf.set>(id, { _id: "set" });
    realmRes.name = realmMeta.name;
    realmRes.img = realmMeta.img || false;

    res.json({ err: false, state: 0, data: realmRes });
});

router.get("/", global.authenticateMiddleware, async (req, res) => {
    const { id } = req.query as { id: Id };
    const suser: Socket_User = {
        _id: req.user,
        name: undefined,
        email: undefined
    };
    const data = await realm_join(suser, id);
    if(data.err){
        const err = data.err as Socket_StandardRes_Error;
        if(err[0] == "error.valid") return res.status(400).json({ err: true, c: InternalCode.UserError.Express.MissingParameters, msg: err[2] });
        else return res.json({ err: true, c: InternalCode.UserError.Express.RealmJoin, msg: err.slice(2) });
    }

    res.json({ err: false, msg: "ok" });
});

export default router;