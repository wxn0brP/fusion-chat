import { Router } from "express";
import NodeCache from "node-cache";
import db from "../../../dataBase";
import valid from "../../../logic/validData";
import { combineId } from "../../../logic/chatMgmt";
import { Id } from "../../../types/base";

const router = Router();
const cache = new NodeCache();

router.get("/id/event", async (req, res) => {
    const { id } = req.query as { id: Id };
    if(!valid.id(id)) return res.json({ err: true, msg: "event is not valid" });

    let name = cache.get(id);
    if(!name){
        const data = await db.realmData.findOne("events.channels", (data, ctx) => {
            const { tr, tc } = data;
            return ctx.combineId(tr, tc) == ctx.id;
        }, { id, combineId: combineId });
        if(!data){
            return res.json({ err: true, msg: "event is not valid" });
        }
        const chnl = await db.realmConf.findOne(data.tr, { chid: data.tc });
        if(!chnl){
            return res.json({ err: true, msg: "event is not valid" });
        }
        const realmName = await db.realmConf.findOne(data.tr, { _id: "set" }).then(({ name }) => name);
        name = realmName + " > " + chnl.name;
        cache.set(id, name);
    }

    res.json({ err: false, name });
});

export default router;