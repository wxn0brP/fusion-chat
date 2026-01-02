import { FFRequest, Router } from "@wxn0brp/falcon-frame";
import FileUploadEngine from "../../profileUpload";
import { Id } from "@wxn0brp/db";
import valid from "#logic/validData";
import { canUserEditBot } from "../../../socket/dev-panel/logic/menageBot";
import db from "#db";

export const botProfileRouter = new Router();
const UPLOAD_DIR = "userFiles/profiles";

const botProfileEngine = new FileUploadEngine({
	maxFileSize: global.fileConfig.maxBotProfileFileSize,
	allowedFileTypes: ["image/png", "image/jpeg", "image/jpg", "image/gif"],
	uploadDir: UPLOAD_DIR,
	routePath: "/upload",
	fileNameGenerator: (req: FFRequest) => req.headers.id as string,
	permissionCheck: async (req: FFRequest) => {
		const botId = req.headers.id as Id;
		if (!valid.id(botId)) {
			throw new Error("botId is missing or invalid");
		}

		const userId = req.user;
		const suser = {
			_id: userId,
			name: undefined,
			email: undefined,
		};
		return await canUserEditBot(suser, botId);
	},
	postProcessCallback: async (filePath: string, req: FFRequest) => {
		await db.botData.updateOneOrAdd(
			req.headers.id as Id,
			{ _id: "img" },
			{},
		);
	},
});

botProfileRouter.use(botProfileEngine.getRouter());