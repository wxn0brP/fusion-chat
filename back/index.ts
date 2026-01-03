import { loadTasks } from "#schedule";
import http from "http";
import { app } from "./http";
import { io } from "./socket/server";
import "./socket";
Error.stackTraceLimit = 100;

app.setVar("layout", "front/main/layout.html");

const server = http.createServer(app.getApp());
io.createServer(server);

lo("__________________" + (new Date() + "").split(" ").slice(1, 5).join(" "));
server.listen(parseInt(process.env.PORT), function () {
	if (process.env.NODE_ENV == "development") {
		lo("Server started by developer mode");
		lo("http://localhost:" + process.env.PORT + "/app");
	}
});

loadTasks();

io.falconFrame(app);
app.set404((req, res) => {
	res.render("front/main/404", {
		title: "Fusion Chat | Page Not Found",
	});
});