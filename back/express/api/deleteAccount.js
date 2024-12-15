import { Router } from "express";
const router = Router();
import { decode, KeyIndex } from "../../logic/token/index.js";
import { comparePasswords, randomDelay } from "./login.js";

export const path = "account/delete";

router.get("/get", async (req, res) => {
    const { token } = req.query;
    if(!token) return res.json({ err: true, msg: "token is required" });

    const tokenData = await decode(token, KeyIndex.GENERAL);
    if(!tokenData) return res.json({ err: true, msg: "invalid token" });

    const user = await global.db.data.findOne("user", { _id: tokenData.user });
    if(!user) return res.json({ err: true, msg: "user is not found" });

    res.json({ err: false, name: user.name });
});

router.post("/confirm", async (req, res) => {
    const { token, pass } = req.body;
    if(!token) return res.json({ err: true, msg: "token is required" });
    if(!pass) return res.json({ err: true, msg: "pass is required" });
    randomDelay(500, 1500);

    const tokenData = await decode(token, KeyIndex.GENERAL);
    if(!tokenData) return res.json({ err: true, msg: "invalid token" });

    const user = await global.db.data.findOne("user", { _id: tokenData.user });
    if(!user) return res.json({ err: true, msg: "user is not found" });

    const isPasswordValid = comparePasswords(user.password, pass);
    if(!isPasswordValid) return res.json({ err: true, msg: "invalid password" });

    const existingTask = await global.db.system.findOne("tasks", { type: "deleteAccount", data: { user: user._id } });
    if(existingTask) return res.json({ err: true, msg: "account is already pending to be deleted" });

    const removeTime = new Date().getTime() + 1000 * 60 * 60 * 24; // 1 day

    global.db.system.add("tasks", {
        type: "deleteAccount",
        sType: "one-time",
        sTime: Math.floor(removeTime / 1000),
        data: {
            user: user._id,
        }
    })

    res.json({ err: false, msg: "account pending to be deleted" });
});

router.post("/undo", async (req, res) => {
    const { token } = req.body;
    if(!token) return res.json({ err: true, msg: "token is required" });

    const tokenData = await decode(token, KeyIndex.GENERAL);
    if(!tokenData) return res.json({ err: true, msg: "invalid token" });

    const rm = await global.db.system.removeOne("tasks", { type: "deleteAccount", data: { user: tokenData.user } });
    res.json(
        rm ?
        { err: false, msg: "successfully remove pending to be deleted" } :
        { err: true, msg: "pending process is not found" }
    );
});

export default router;