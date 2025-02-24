import { Request, Router } from "express";
import FileUploadEngine from "../../profileUpload";

const router = Router();
const UPLOAD_DIR = "userFiles/profiles";

const userProfileEngine = new FileUploadEngine({
    maxFileSize: global.fileConfig.maxUserProfileFileSize,
    allowedFileTypes: ["image/png", "image/jpeg", "image/jpg", "image/gif"],
    uploadDir: UPLOAD_DIR,
    routePath: "/upload",
    fileNameGenerator: (req: Request) => req.user,
});

const imageGetterRouter = userProfileEngine.createImageGetter(
    "/img",
    UPLOAD_DIR,
    "front/static/defaultProfile.png"
);

router.use(userProfileEngine.getRouter());
router.use(imageGetterRouter);

export const path = "profile";
export default router;