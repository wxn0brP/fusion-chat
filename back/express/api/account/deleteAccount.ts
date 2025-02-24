import InternalCode from "#codes";
import db from "#db";
import { decode, KeyIndex } from "#logic/token/index";
import { addTask, cancelTask } from "#schedule";
import Db_Data from "#types/db/data";
import { Router } from "express";
import { comparePasswords, randomDelay } from "./login";
const router = Router();

export const path = "account/delete";

router.get("/get", async (req, res) => {
    const { token } = req.query as { token: string };
    if(!token) return res.json({ err: true, c: InternalCode.UserError.Express.MissingParameters, msg: "token" });

    const tokenData = await decode(token, KeyIndex.GENERAL) as { user: string };
    if(!tokenData) return res.json({ err: true, c: InternalCode.UserError.Express.DeleteAccountGet_InvalidToken, msg: "invalid token" });

    const user = await db.data.findOne<Db_Data.user>("user", { _id: tokenData.user });
    if(!user) return res.json({ err: true, c: InternalCode.UserError.Express.DeleteAccountGet_UserNotFound, msg: "user is not found" });

    res.json({ err: false, name: user.name });
});

router.post("/confirm", async (req, res) => {
    const { token, pass } = req.body;
    if(!token) return res.json({ err: true, c: InternalCode.UserError.Express.MissingParameters, msg: "token" });
    if(!pass) return res.json({ err: true, c: InternalCode.UserError.Express.MissingParameters, msg: "pass" });
    randomDelay(500, 1500);

    const tokenData = await decode(token, KeyIndex.GENERAL) as { user: string };
    if(!tokenData) return res.json({ err: true, c: InternalCode.UserError.Express.DeleteAccountConfirm_InvalidToken, msg: "invalid token" });

    const user = await db.data.findOne<Db_Data.user>("user", { _id: tokenData.user });
    if(!user) return res.json({ err: true, c: InternalCode.UserError.Express.DeleteAccountConfirm_UserNotFound, msg: "user is not found" });

    const isPasswordValid = comparePasswords(user.password, pass);
    if(!isPasswordValid) return res.json({ err: true, c: InternalCode.UserError.Express.DeleteAccountConfirm_InvalidPassword, msg: "invalid password" });

    const existingTask = await db.system.findOne("tasks", { type: "deleteAccount", data: { user: user._id } });
    if(existingTask) return res.json({
        err: true,
        c: InternalCode.UserError.Express.DeleteAccountConfirm_AlreadyPending,
        msg: "account is already pending to be deleted"
    });

    const removeTime = new Date().getTime() + 1000 * 60 * 60 * 24; // 1 day

    await addTask({
        type: "deleteAccount",
        sType: "one-time",
        sTime: Math.floor(removeTime / 1000),
        data: {
            user: user._id,
        }
    });

    res.json({ err: false, msg: "account pending to be deleted" });
});

router.post("/undo", async (req, res) => {
    const { token } = req.body;
    if(!token) return res.json({ err: true, c: InternalCode.UserError.Express.MissingParameters, msg: "token" });

    const tokenData = await decode(token, KeyIndex.GENERAL);
    if(!tokenData) return res.json({ err: true, c: InternalCode.UserError.Express.DeleteAccountUndo_InvalidToken, msg: "invalid token" });

    const task = await db.system.findOne("tasks", { type: "deleteAccount", data: { user: tokenData.user } });
    if(!task) return res.json({ err: true, c: InternalCode.UserError.Express.DeleteAccountUndo_PendingNotFound, msg: "pending process is not found" });

    await db.system.removeOne("tasks", { type: "deleteAccount", data: { user: tokenData.user } });
    await cancelTask(task._id);
    res.json({ err: false, msg: "successfully remove pending to be deleted" });
});

export default router;