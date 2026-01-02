import { Router } from "@wxn0brp/falcon-frame";
import { readdirSync } from "fs";

const frontRouter = new Router();
const apiRouter = new Router();
global.app.use("/", frontRouter);
global.app.use("/api", apiRouter);

const apiPath = `${import.meta.dirname}/api/`;
for (const file of readdirSync(apiPath, {
	recursive: true,
	withFileTypes: true,
})) {
	if (!file.isFile() || !file.name.endsWith(".js")) continue;
	const filePath = file.parentPath.replace(apiPath, "") + "/" + file.name;
	const { path: routerPath, default: router } = await import(
		"./api/" + filePath
	);

	apiRouter.use("/" + (routerPath || ""), router);
}

const cards = [
	{ title: "Easy to Use", body: "Simple interface, easy to navigate." },
	{ title: "Customizable Themes", body: "Personalize the look according to preferences." },
	{ title: "Community and Support", body: "Support from the community and team." },
	{ title: "Updates and Information", body: "Receive the latest updates." },
	{ title: "Privacy and Security", body: "Strong encryption for your privacy." },
	{ title: "Multi-platform Versions", body: "Available on various devices." },
	{ title: "User Management", body: "Easy community management." },
	{ title: "Starter Kits", body: "Quick start with starter kits." }
]

const pages = {
	index: {
		title: "Welcome to Fusion Chat",
		description: "Fusion Chat is a free, open source, and privacy-friendly chat application.",
		cards: renderCards()
	},
	get: {
		title: "Download Fusion Chat",
		description: "Download Fusion Chat for free"
	},
	register: {
		title: "Fusion Chat | Register"
	},
	login: {
		title: "Login to Fusion Chat"
	},
	"register-code": {
		title: "Fusion Chat | Register"
	},
	tos: {
		title: "Fusion Chat | Terms of Service"
	},
	"privacy-policy": {
		title: "Fusion Chat | Privacy Policy"
	},
	ir: {
		title: "Join To realm"
	},
	"iv/bot": {
		title: "Invite bot"
	}
}

function renderCards() {
	return cards.map(card => (
		`<li class="link-card">
			<span>
				<h2>
					<span>&rarr;</span>
					${card.title}
				</h2>
				<p>
					${card.body}
				</p>
			</span>
		</li>`
	)).join("");
}

frontRouter.get("/app", (req, res) => res.render("app/app.html", {}, { baseDir: "front" }));
frontRouter.get("/dev-panel", (req, res) => res.render("public/dev-panel.html"));
frontRouter.static("/", "front/main", {
	renderData: pages
});