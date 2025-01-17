import { Router } from "express";
const router = Router();
import { decode, KeyIndex } from "../../../logic/token/index.js";
import { comparePasswords, randomDelay } from "./login.js";
import db from "../../../dataBase.js";
import Db_Data from "../../../types/db/data.js";
import { cancelTask } from "../../../schedule/index.js";

export const path = "account/delete";

router.get("/get", async (req, res) => {
    const { token } = req.query as { token: string };
    if(!token) return res.json({ err: true, msg: "token is required" });

    const tokenData = await decode(token, KeyIndex.GENERAL) as { user: string };
    if(!tokenData) return res.json({ err: true, msg: "invalid token" });

    const user = await db.data.findOne<Db_Data.user>("user", { _id: tokenData.user });
    if(!user) return res.json({ err: true, msg: "user is not found" });

    res.json({ err: false, name: user.name });
});

router.post("/confirm", async (req, res) => {
    const { token, pass } = req.body;
    if(!token) return res.json({ err: true, msg: "token is required" });
    if(!pass) return res.json({ err: true, msg: "pass is required" });
    randomDelay(500, 1500);

    const tokenData = await decode(token, KeyIndex.GENERAL) as { user: string };
    if(!tokenData) return res.json({ err: true, msg: "invalid token" });

    const user = await db.data.findOne<Db_Data.user>("user", { _id: tokenData.user });
    if(!user) return res.json({ err: true, msg: "user is not found" });

    const isPasswordValid = comparePasswords(user.password, pass);
    if(!isPasswordValid) return res.json({ err: true, msg: "invalid password" });

    const existingTask = await db.system.findOne("tasks", { type: "deleteAccount", data: { user: user._id } });
    if(existingTask) return res.json({ err: true, msg: "account is already pending to be deleted" });

    const removeTime = new Date().getTime() + 1000 * 60 * 60 * 24; // 1 day

    db.system.add("tasks", {
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

    const task = await db.system.findOne("tasks", { type: "deleteAccount", data: { user: tokenData.user } });
    if(!task) return res.json({ err: true, msg: "pending process is not found" });

    await db.system.removeOne("tasks", { type: "deleteAccount", data: { user: tokenData.user } });
    cancelTask(task._id);
    res.json({ err: false, msg: "successfully remove pending to be deleted" });
});

export default router;