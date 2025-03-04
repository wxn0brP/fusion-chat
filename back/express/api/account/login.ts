import InternalCode from "#codes";
import db from "#db";
import { createUser } from "#logic/auth";
import mailer from "#logic/mail";
import Db_Data from "#types/db/data";
import { createHash, timingSafeEqual } from "crypto";
import { Router } from "express";
const router = Router();

router.post("/login", async (req, res) => {
    const { name, password } = req.body as { name: string, password: string };
    if (!name) return res.json({ err: true, c: InternalCode.UserError.Express.MissingParameters, msg: "name" });
    if (!password) return res.json({ err: true, c: InternalCode.UserError.Express.MissingParameters, msg: "password" });

    let user = await db.data.findOne<Db_Data.user>("user", { name });
    if(!user){
        user = await db.data.findOne("user", { email: name });
        if(!user){
            await global.delay(randomDelay(500, 1500));
            return res.json({ err: true, c: InternalCode.UserError.Express.Login_InvalidCredentials, msg: "Invalid credentials" });
        }
    }

    const isPasswordValid = comparePasswords(user.password, password);
    if(!isPasswordValid){
        await global.delay(randomDelay(500, 1500));
        return res.json({ err: true, c: InternalCode.UserError.Express.Login_InvalidCredentials, msg: "Invalid credentials" });
    }

    const token = await createUser(user);
    await global.delay(randomDelay(500, 1500));
    res.json({ err: false, msg: "Login successful", token, from: user.name, user_id: user._id });
    await db.data.add("token", { token }, false);

    if(global.logsConfig.mail.loginWarn){
        const deviceInfo = req.headers["user-agent"] || "Unknown Device";
        mailer("login", user.email, user.name, deviceInfo); // warning to email for login
    }
});

export function comparePasswords(hashPassword, inputPassword){
    return timingSafeEqual(Buffer.from(hashPassword, "utf-8"), Buffer.from(generateHash(inputPassword), "utf-8"));
}

export function generateHash(password){
    return createHash("sha256").update(password).digest("hex");
}

export function randomDelay(min, max){
    return Math.floor(Math.random() * (max - min + 1) + min);
}

export default router;