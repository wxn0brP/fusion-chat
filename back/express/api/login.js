import { Router } from 'express';
import { timingSafeEqual, createHash } from 'crypto';
import { createUser as createJWT } from "../../logic/auth.js";
import mailer from "../../logic/mail.js";
const router = Router();

router.post("/login", async (req, res) => {
    const { name, password } = req.body;
    if (!name || !password) return res.json({ err: true, msg: "Name and password are required" });

    let user = await global.db.data.findOne("user", { name });
    if(!user){
        user = await global.db.data.findOne("user", { email: name });
        if(!user){
            await delay(randomDelay(500, 1500));
            return res.json({ err: true, msg: "Invalid credentials" });
        }
    }

    const isPasswordValid = comparePasswords(user.password, password);
    if(!isPasswordValid){
        await delay(randomDelay(500, 1500));
        return res.json({ err: true, msg: "Invalid credentials" });
    }

    const token = createJWT(user);
    await delay(randomDelay(500, 1500));
    res.json({ err: false, msg: "Login successful", token, from: user.name, user_id: user._id });
    await global.db.data.add("token", { token }, false);

    const deviceInfo = req.headers['user-agent'] || 'Unknown Device';
    mailer("login", user.email, user.name, deviceInfo); // warning to email for login
});

function comparePasswords(hashPassword, inputPassword){
    return timingSafeEqual(Buffer.from(hashPassword, 'utf-8'), Buffer.from(generateHash(inputPassword), 'utf-8'));
}

function generateHash(password){
    return createHash('sha256').update(password).digest("hex");
}

function randomDelay(min, max){
    return Math.floor(Math.random() * (max - min + 1) + min);
}

export default router;