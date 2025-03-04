import InternalCode from "../../../codes/index.js";
import db from "../../../dataBase.js";
import mailer from "../../../logic/mail.js";
import { createHash } from "crypto";
import { Router } from "express";
const router = Router();
router.post("/register", async function (req, res) {
    const { name, password, email } = req.body;
    if (!name)
        return res.json({ err: true, c: InternalCode.UserError.Express.MissingParameters, msg: "name" });
    if (!password)
        return res.json({ err: true, c: InternalCode.UserError.Express.MissingParameters, msg: "password" });
    if (!email)
        return res.json({ err: true, c: InternalCode.UserError.Express.MissingParameters, msg: "email" });
    const existingUserByName = await db.data.findOne("user", { name });
    if (existingUserByName)
        return res.json({ err: true, c: InternalCode.UserError.Express.Register_UsernameTaken, msg: "User with this name already exists!" });
    const existingUserByEmail = await db.data.findOne("user", { email });
    if (existingUserByEmail)
        return res.json({ err: true, c: InternalCode.UserError.Express.Register_EmailTaken, msg: "User with this email already exists!" });
    if (!/^[a-zA-Z0-9]+$/.test(name) || name.length < 3 || name.length > 10) {
        return res.json({ err: true, c: InternalCode.UserError.Express.Register_InvalidName, msg: "Username does not meet requirements!" });
    }
    if (!password.match(/[a-z]/) ||
        !password.match(/[A-Z]/) ||
        !password.match(/[0-9]/) ||
        !password.match(/[-!$%^&*()_+|~=`{}\[\]:\/;<>?,.@#]/) ||
        password.length < 8 ||
        password.length > 300) {
        return res.json({ err: true, c: InternalCode.UserError.Express.Register_InvalidPassword, msg: "Password does not meet requirements!" });
    }
    const verificationCode = generateVerificationCode();
    const hashedPassword = generateHash(password);
    const mailSent = mailer("register", email, verificationCode);
    if (!mailSent) {
        console.error("Failed to send registration confirmation email");
        return res.json({ err: true, c: InternalCode.ServerError.Express.Register_FailedToSendEmail, msg: "Failed to send registration confirmation email" });
    }
    req.session.tmp_user = { name, password: hashedPassword, email, verificationCode, attemptsLeft: 3 };
    res.json({ err: false, msg: "Verification code sent" });
});
router.post("/register/verify", async function (req, res) {
    if (!req.session.tmp_user)
        return res.json({ err: true, c: InternalCode.UserError.Express.RegisterVerify_InvalidSession, msg: "No authentication data found" });
    const { verificationCode } = req.session.tmp_user;
    const codeFromRequest = req.body.code;
    if (!codeFromRequest)
        return res.json({ err: true, c: InternalCode.UserError.Express.MissingParameters, msg: "verificationCode" });
    if (req.session.tmp_user.attemptsLeft <= 0) {
        delete req.session.tmp_user;
        return res.json({ err: true, c: InternalCode.UserError.Express.RegisterVerify_TooManyAttempts, msg: "Too many attempts" });
    }
    if (codeFromRequest !== verificationCode) {
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
    if (!newUser)
        return res.json({
            err: true,
            c: InternalCode.ServerError.Express.RegisterVerify_FailedToRegisterUser,
            msg: "Failed to register user"
        });
    delete req.session.tmp_user;
    res.json({ err: false, msg: "Welcome!" });
});
function generateHash(password) {
    return createHash("sha256").update(password).digest("hex");
}
function generateVerificationCode() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}
export default router;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVnaXN0ZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9iYWNrL2V4cHJlc3MvYXBpL2FjY291bnQvcmVnaXN0ZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxZQUFZLE1BQU0sUUFBUSxDQUFDO0FBQ2xDLE9BQU8sRUFBRSxNQUFNLEtBQUssQ0FBQztBQUNyQixPQUFPLE1BQU0sTUFBTSxhQUFhLENBQUM7QUFDakMsT0FBTyxFQUFFLFVBQVUsRUFBRSxNQUFNLFFBQVEsQ0FBQztBQUNwQyxPQUFPLEVBQUUsTUFBTSxFQUFFLE1BQU0sU0FBUyxDQUFDO0FBQ2pDLE1BQU0sTUFBTSxHQUFHLE1BQU0sRUFBRSxDQUFDO0FBRXhCLE1BQU0sQ0FBQyxJQUFJLENBQUMsV0FBVyxFQUFFLEtBQUssV0FBVSxHQUFHLEVBQUUsR0FBRztJQUM1QyxNQUFNLEVBQUUsSUFBSSxFQUFFLFFBQVEsRUFBRSxLQUFLLEVBQUUsR0FBRyxHQUFHLENBQUMsSUFBSSxDQUFDO0lBQzNDLElBQUcsQ0FBQyxJQUFJO1FBQUUsT0FBTyxHQUFHLENBQUMsSUFBSSxDQUFDLEVBQUUsR0FBRyxFQUFFLElBQUksRUFBRSxDQUFDLEVBQUUsWUFBWSxDQUFDLFNBQVMsQ0FBQyxPQUFPLENBQUMsaUJBQWlCLEVBQUUsR0FBRyxFQUFFLE1BQU0sRUFBRSxDQUFDLENBQUM7SUFDM0csSUFBRyxDQUFDLFFBQVE7UUFBRSxPQUFPLEdBQUcsQ0FBQyxJQUFJLENBQUMsRUFBRSxHQUFHLEVBQUUsSUFBSSxFQUFFLENBQUMsRUFBRSxZQUFZLENBQUMsU0FBUyxDQUFDLE9BQU8sQ0FBQyxpQkFBaUIsRUFBRSxHQUFHLEVBQUUsVUFBVSxFQUFFLENBQUMsQ0FBQztJQUNuSCxJQUFHLENBQUMsS0FBSztRQUFFLE9BQU8sR0FBRyxDQUFDLElBQUksQ0FBQyxFQUFFLEdBQUcsRUFBRSxJQUFJLEVBQUUsQ0FBQyxFQUFFLFlBQVksQ0FBQyxTQUFTLENBQUMs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