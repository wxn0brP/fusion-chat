const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const crypto = require('crypto');
const app = express();
global.app = app;
app.set('view engine', 'ejs');
app.set('views', 'front');

app.use(require("cors")({
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

app.use("/", express.static("front/astro"));
app.use("/", express.static("front/public"));
app.use("/assets", express.static("front/assets"));
app.use("/app", express.static("front/app"));
app.use("/meta", express.static("front/meta"));

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
require("./route");

app.use((req, res) => {
    res.render("main/404", (err, body) => {
        if(err) throw err;
        res.render("layout/main", {
            layout: {
                title: "404",
            },
            body
        });
    });
});

module.exports = app;