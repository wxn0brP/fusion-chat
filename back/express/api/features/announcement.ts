import { Router } from "express";
import valid, { validChannelId } from "../../../logic/validData";
import db from "../../../dataBase";
import InternalCode from "../../../codes";
const router = Router();

router.get("/announcement", async (req, res) => {
    let { realm, chnl, start: startStr, end: endStr } = req.query as { realm: string, chnl: string, start: string, end: string };
    const start = parseInt(startStr);
    const end = parseInt(endStr);

    if (!valid.id(realm)) return res.json({ err: true, c: InternalCode.UserError.Express.MissingParameters, msg: "realm" });
    if (!validChannelId(chnl)) return res.json({ err: true, c: InternalCode.UserError.Express.MissingParameters, msg: "channel" });
    if (!valid.num(start, 0)) return res.json({ err: true, c: InternalCode.UserError.Express.MissingParameters, msg: "start" });
    if (!valid.num(end, 0)) return res.json({ err: true, c: InternalCode.UserError.Express.MissingParameters, msg: "end" });

    const chnlData = await db.realmConf.findOne(realm, { chid: chnl });
    if (!chnlData) return res.json({
        err: true,
        c: InternalCode.UserError.Express.Announcement_ChannelIsNotOpen,
        msg: "channel is not open event"
    });
    if (chnlData.type != "open_announcement") return res.json({
        err: true,
        c: InternalCode.UserError.Express.Announcement_ChannelIsNotOpen,
        msg: "channel is not open announcement"
    });

    let data = await db.mess.find(realm, { chnl }, {}, { reverse: true, max: end + start })
    data = data
        .slice(start, end)
        .map(msg => {
            return {
                fr: msg.fr,
                msg: msg.msg
            }
        })

    res.json({ err: false, data });
});

export default router;