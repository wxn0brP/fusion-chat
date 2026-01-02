import { Router } from "@wxn0brp/falcon-frame";
import FileUploadEngine from "../../profileUpload";

export const userProfileRouter = new Router();
const UPLOAD_DIR = "userFiles/profiles";

const userProfileEngine = new FileUploadEngine({
	maxFileSize: global.fileConfig.maxUserProfileFileSize,
	allowedFileTypes: ["image/png", "image/jpeg", "image/jpg", "image/gif"],
	uploadDir: UPLOAD_DIR,
	routePath: "/upload",
	fileNameGenerator: (req) => req.user,
});

const imageGetterRouter = userProfileEngine.createImageGetter(
	"/img",
	UPLOAD_DIR,
	"front/static/defaultProfile.png",
);

userProfileRouter.use(userProfileEngine.getRouter());
userProfileRouter.use(imageGetterRouter);