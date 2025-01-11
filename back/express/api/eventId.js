import { Router } from "express";
import valid from "../../logic/validData.js";
import NodeCache from "node-cache";
import db from "../../dataBase.js";
import { combineId } from "../../logic/chatMgmt.js";

const router = Router();
const cache = new NodeCache();

router.get("/id/event", async (req, res) => {
    const { id } = req.query;
    if(!valid.id(id)) return res.json({ err: true, msg: "event is not valid" });

    let name = cache.get(id);
    if(!name){
        const data = await db.realmData.findOne("events.channels", (data, ctx) => {
            const { tr, tc } = data;
            return ctx.combinateId(tr, tc) == ctx.id;
        }, { id, combinateId: combineId });
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