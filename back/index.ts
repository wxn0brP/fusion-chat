import http from "http";
import { app } from "./http";
Error.stackTraceLimit = 100;

app.setVar("layout", "front/main/layout.html");

const server = http.createServer(app.getApp());
globalThis.server = server;

lo("__________________" + (new Date() + "").split(" ").slice(1, 5).join(" "));
server.listen(parseInt(process.env.PORT), function () {
	if (process.env.NODE_ENV == "development") {
		lo("Server started by developer mode");
		lo("http://localhost:" + process.env.PORT + "/app");
	}
});

await import("./socket/index.js");
await import("./schedule/index.js");

const statusRouter = globalThis.io.statusRouter();
app.use("/gloves-link", statusRouter);

app.use((req, res) => {
	res.status(404);
	res.render("front/main/404", {
		title: "Fusion Chat | Page Not Found",
	});
});