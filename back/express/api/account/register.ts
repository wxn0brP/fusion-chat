import { Router } from 'express';
import { createHash } from 'crypto';
import mailer from "../../../logic/mail.js";
import db from '../../../dataBase.js';
const router = Router();

router.post("/register", async function(req, res){
    const { name, password, email } = req.body;
    if(!name || !password || !email) return res.json({ err: true, msg: "name, pass, and email are required" });

    const existingUserByName = await db.data.findOne("user", { name });
    if(existingUserByName) return res.json({ err: true, msg: "User with this name already exists!" });

    const existingUserByEmail = await db.data.findOne("user", { email });
    if(existingUserByEmail) return res.json({ err: true, msg: "User with this email already exists!" });

    if(!/^[a-zA-Z0-9]+$/.test(name) || name.length < 3 || name.length > 10) {
        return res.json({ err: true, msg: "Username does not meet requirements!" });
    }

    if(
        !password.match(/[a-z]/) ||
        !password.match(/[A-Z]/) ||
        !password.match(/[0-9]/) ||
        !password.match(/[-!$%^&*()_+|~=`{}\[\]:\/;<>?,.@#]/) ||
        password.length < 8 ||
        password.length > 300
    ){
        return res.json({ err: true, msg: "Password does not meet requirements!" });
    }

    const verificationCode = generateVerificationCode();
    const hashedPassword = generateHash(password);

    const mailSent = mailer("register", email, verificationCode);
    if(!mailSent){
        console.error("Failed to send registration confirmation email");
        return res.json({ err: true, msg: "Failed to send registration confirmation email" });
    }

    req.session.tmp_user = { name, password: hashedPassword, email, verificationCode, attemptsLeft: 3 };

    res.json({ err: false, msg: "Verification code sent" });
});

router.post("/register/verify", async function(req, res){
    if(!req.session.tmp_user) return res.json({ err: true, msg: "No authentication data found" });
    const { verificationCode } = req.session.tmp_user;

    const codeFromRequest = req.body.code;
    if(!codeFromRequest) return res.json({ err: true, msg: "Verification code is required" });

    if(req.session.tmp_user.attemptsLeft <= 0){
        delete req.session.tmp_user;
        return res.json({ err: true, msg: "Too many attempts" });
    }

    if(codeFromRequest !== verificationCode){
        req.session.tmp_user.attemptsLeft -= 1;
        return res.json({ err: true, msg: `Invalid code. Attempts left: ${req.session.tmp_user.attemptsLeft}` });
    }

    const { name, email, password } = req.session.tmp_user;
    const newUser = await db.data.add("user", { name, email, password });
    if(!newUser) return res.json({ err: true, msg: "Failed to register user" });

    delete req.session.tmp_user;

    res.json({ err: false, msg: "Welcome!" });
});

function generateHash(password){
    return createHash('sha256').update(password).digest("hex");
}

function generateVerificationCode(){
    return Math.floor(100000 + Math.random() * 900000).toString();
}

export default router;