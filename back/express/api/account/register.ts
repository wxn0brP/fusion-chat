import InternalCode from "#codes";
import db from "#db";
import mailer from "#logic/mail";
import { createHash } from "crypto";
import { Router } from "express";
const router = Router();

router.post("/register", async function(req, res){
    const { name, password, email } = req.body;
    if(!name) return res.json({ err: true, c: InternalCode.UserError.Express.MissingParameters, msg: "name" });
    if(!password) return res.json({ err: true, c: InternalCode.UserError.Express.MissingParameters, msg: "password" });
    if(!email) return res.json({ err: true, c: InternalCode.UserError.Express.MissingParameters, msg: "email" });

    const existingUserByName = await db.data.findOne("user", { name });
    if(existingUserByName) return res.json({ err: true, c: InternalCode.UserError.Express.Register_UsernameTaken, msg: "User with this name already exists!" });

    const existingUserByEmail = await db.data.findOne("user", { email });
    if(existingUserByEmail) return res.json({ err: true, c: InternalCode.UserError.Express.Register_EmailTaken, msg: "User with this email already exists!" });

    if(!/^[a-zA-Z0-9]+$/.test(name) || name.length < 3 || name.length > 10) {
        return res.json({ err: true, c: InternalCode.UserError.Express.Register_InvalidName, msg: "Username does not meet requirements!" });
    }

    if(
        !password.match(/[a-z]/) ||
        !password.match(/[A-Z]/) ||
        !password.match(/[0-9]/) ||
        !password.match(/[-!$%^&*()_+|~=`{}\[\]:\/;<>?,.@#]/) ||
        password.length < 8 ||
        password.length > 300
    ){
        return res.json({ err: true, c: InternalCode.UserError.Express.Register_InvalidPassword, msg: "Password does not meet requirements!" });
    }

    const verificationCode = generateVerificationCode();
    const hashedPassword = generateHash(password);

    const mailSent = mailer("register", email, verificationCode);
    if(!mailSent){
        console.error("Failed to send registration confirmation email");
        return res.json({ err: true, c: InternalCode.ServerError.Express.Register_FailedToSendEmail, msg: "Failed to send registration confirmation email" });
    }

    req.session.tmp_user = { name, password: hashedPassword, email, verificationCode, attemptsLeft: 3 };

    res.json({ err: false, msg: "Verification code sent" });
});

router.post("/register/verify", async function(req, res){
    if(!req.session.tmp_user) return res.json({ err: true, c: InternalCode.UserError.Express.RegisterVerify_InvalidSession, msg: "No authentication data found" });
    const { verificationCode } = req.session.tmp_user;

    const codeFromRequest = req.body.code;
    if(!codeFromRequest) return res.json({ err: true, c: InternalCode.UserError.Express.MissingParameters, msg: "verificationCode" });

    if(req.session.tmp_user.attemptsLeft <= 0){
        delete req.session.tmp_user;
        return res.json({ err: true, c: InternalCode.UserError.Express.RegisterVerify_TooManyAttempts, msg: "Too many attempts" });
    }

    if(codeFromRequest !== verificationCode){
        req.session.tmp_user.attemptsLeft -= 1;
        return res.json({
            err: true,
            c: InternalCode.UserError.Express.RegisterVerify_InvalidCode,
            msg: `Invalid code. Attempts left: ${req.session.tmp_user.attemptsLeft}`,
            data: req.session.tmp_user.attemptsLeft
        });
    }

    const { name, email, password } = req.session.tmp_user;
    const newUser = await db.data.add("user", { name, email, password });
    if(!newUser) return res.json({
        err: true,
        c: InternalCode.ServerError.Express.RegisterVerify_FailedToRegisterUser,
        msg: "Failed to register user"
    });

    delete req.session.tmp_user;

    res.json({ err: false, msg: "Welcome!" });
});

function generateHash(password: string){
    return createHash("sha256").update(password).digest("hex");
}

function generateVerificationCode(){
    return Math.floor(100000 + Math.random() * 900000).toString();
}

export default router;