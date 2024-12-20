import express from 'express';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import crypto from 'crypto';
import { authUser } from '../logic/auth.js';
import cors from 'cors';

const app = express();
global.app = app;
app.set('view engine', 'ejs');
app.set('views', 'front');

app.use(cors({
    origin: "*"
}));

app.use("/", express.static("front/static"));
const pageBreak = process.env.pageBreak;
if(pageBreak == "true"){
    app.use((req, res) => {
        res.status(503).send(`
            <link rel="stylesheet" href="/style.css"></link>
            <link rel="shortcut icon" href="/favicon.svg" type="image/x-icon">
            <title>Fusion Chat</title>
            <br />
            <h1>Sorry! Server go to chase squirrels. Be back soon, hopefully with better speed!</h1>
        `.trim());
    });
}

app.use("/", express.static("front/public"));
app.use("/assets", express.static("front/assets"));
app.use("/app", express.static("front/app"));
app.use("/dev-panel", express.static("front/dev-panel"));
app.use("/meta", express.static("front/meta"));
app.use("/userFiles", express.static("userFiles"));

//parser
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

global.sessions = {};
app.use((req, res, next) => {
    const sessionId = req.cookies.session;
    let session = global.sessions[sessionId];
    if(!session){
        const id = crypto.randomBytes(64).toString('hex');
        res.cookie("session", id, { sameSite: 'strict' });
        session = global.sessions[id] = {};
    }
    req.session = session;
    next();
});

global.authenticateMiddleware = async (req, res, next) => {
    const token = req.headers['authorization'];
    if(!token){
        return res.status(401).json({ err: true, msg: 'Access denied. No token provided.' });
    }

    try{
        const user = await authUser(token);
        if(!user){
            return res.status(401).json({ err: true, msg: 'Invalid token.' });
        }
        req.user = user._id;
        next();
    }catch(err){
        res.status(500).json({ err: true, msg: 'An error occurred during authentication.' });
    }
};

await import("./route.js");

app.use((req, res) => {
    res.render("main/404", (err, body) => {
        if(err) throw err;
        res.status(404).render("layout/main", {
            layout: {
                title: "Fusion Chat | Page Not Found",
            },
            body
        });
    });
});

export default app;