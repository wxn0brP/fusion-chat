import { FalconFrame } from "@wxn0brp/falcon-frame";
import crypto from "crypto";
import { expressMiddleware as bannedIp } from "../bannedIp";
import { apiRouter } from "./api";
import { frontRouter } from "./route";

const app = new FalconFrame();

app.use(bannedIp);
app.setOrigin("*");

app.static("front/static");
if (process.env.IS_TECHNICAL_BREAK == "true") {
	app.use((req, res) => {
		res.status(503).send(
			`
            <link rel="stylesheet" href="/style.css"></link>
            <link rel="shortcut icon" href="/favicon.svg" type="image/x-icon">
            <title>Fusion Chat</title>
            <br />
            <h1>Sorry! Server go to chase squirrels. Be back soon, hopefully with better speed!</h1>
        `.trim(),
		);
	});
}

app.static("/", "front/public");
app.static("/assets", "front/assets");
app.static("/", "front/css");
app.static("/lang", "front/lang");
app.static("/app", "front/app");
app.static("/app/js", "front-app/dist");
app.static("/dev-panel", "front/dev-panel");
app.static("/meta", "front/meta");
app.static("/userFiles", "userFiles");
app.static("/app/src", "front-app/src", { errorIfDirNotFound: false });
app.static("/js", "front-scripts/dist");

global.sessions = {};
app.use((req, res, next) => {
	const sessionId = req.cookies.session;
	let session = global.sessions[sessionId];
	if (!session) {
		const id = crypto.randomBytes(64).toString("hex");
		res.cookie("session", id, { sameSite: "Strict" });
		session = global.sessions[id] = {};
	}
	req.session = session;
	next();
});

app.use("/", frontRouter);
app.use("/api", apiRouter);

export { app };
