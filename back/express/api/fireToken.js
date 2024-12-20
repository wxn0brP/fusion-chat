import { Router } from "express";
import { getTokenFromPointer, cache } from "../../logic/mobileNotif.js";
const router = Router();

router.post("/fireToken", async (req, res) => {
    const { fcToken, fireToken } = req.body;
    if(!fcToken || !fireToken) return res.json({ err: true, msg: "fcToken and fireToken is required" });
    
    const userToken = await getTokenFromPointer(fcToken);
    if(!userToken) return res.json({ err: true, msg: "invalid fcToken" });

    const pairIsset = await global.db.data.findOne("fireToken", {
        fc: userToken.token,
        fire: fireToken
    });
    if(pairIsset) return res.json({ err: false, msg: "ok" });

    await global.db.data.removeOne("fireToken", { fire: fireToken }); // remove if token is registered for another user

    await global.db.data.add("fireToken", {
        fc: userToken.token,
        fire: fireToken,
        user: userToken.user,
        exp: userToken.exp
    }, false);
    
    cache.del(fcToken);
    res.json({ err: false, msg: "ok" });
});

export default router;