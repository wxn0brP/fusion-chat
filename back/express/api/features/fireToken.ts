import { Router } from "express";
import { getTokenFromPointer, cache } from "../../../logic/mobileNotif";
import db from "../../../dataBase";
const router = Router();

router.post("/fireToken", async (req, res) => {
    const { fcToken, fireToken } = req.body;
    if(!fcToken || !fireToken) return res.json({ err: true, msg: "fcToken and fireToken is required" });
    
    const userToken = await getTokenFromPointer(fcToken);
    if(!userToken) return res.json({ err: true, msg: "invalid fcToken" });

    const pairIsset = await db.data.findOne("fireToken", {
        fc: userToken.token,
        fire: fireToken
    });
    if(pairIsset) return res.json({ err: false, msg: "ok" });

    await db.data.removeOne("fireToken", { fire: fireToken }); // remove if token is registered for another user

    await db.data.add("fireToken", {
        fc: userToken.token,
        fire: fireToken,
        user: userToken.user,
        exp: userToken.exp
    }, false);
    
    cache.del(fcToken);
    res.json({ err: false, msg: "ok" });
});

export default router;