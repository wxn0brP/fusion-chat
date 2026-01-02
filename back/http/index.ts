import { FalconFrame } from "@wxn0brp/falcon-frame";
import crypto from "crypto";
import { authUser } from "#logic/auth";
import { expressMiddleware as bannedIp } from "../bannedIp";
import { Socket_User } from "#types/socket/user";
import InternalCode from "#codes";

const app = new FalconFrame();
globalThis.app = app;

app.use(bannedIp);
app.setOrigin("*");
app.setVar("disable compression", true);

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

await import("./sass.js");

app.static("/", "front/public");
app.static("/assets", "front/assets");
app.static("/app", "front/app");
app.static("/app/js", "front-app/dist");
app.static("/dev-panel", "front/dev-panel");
app.static("/meta", "front/meta");
app.static("/userFiles", "userFiles");
app.static("/app/src", "front-app/src");
app.static("/js", "front-scripts/dist-build");

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

global.authenticateMiddleware = async (req, res, next) => {
	const token = req.headers["authorization"];
	if (!token) {
		return res.status(401).json({
			err: true,
			c: InternalCode.UserError.Express.AuthError_TokenRequired,
			msg: "Access denied. No token provided.",
		});
	}

	try {
		const user = (await authUser(token)) as Socket_User;
		if (!user) {
			return res.status(401).json({
				err: true,
				c: InternalCode.UserError.Express.AuthError_InvalidToken,
				msg: "Invalid token.",
			});
		}
		req.user = user._id;
		next();
	} catch (err) {
		res.status(500).json({
			err: true,
			c: InternalCode.ServerError.Express.AuthError,
			msg: "An error occurred during authentication.",
		});
	}
};

await import("./route.js");

export { app };
