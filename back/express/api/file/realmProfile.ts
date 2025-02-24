import InternalCode from "#codes";
import db from "#db";
import Id from "#id";
import permissionSystem from "#logic/permission-system/index";
import Permissions from "#logic/permission-system/permission";
import valid from "#logic/validData";
import { Request, Router } from "express";
import FileUploadEngine from "../../profileUpload";

const router = Router();
const UPLOAD_DIR = "userFiles/realms";

const realmProfileEngine = new FileUploadEngine({
    maxFileSize: global.fileConfig.maxRealmProfileFileSize,
    allowedFileTypes: ["image/png", "image/jpeg", "image/jpg", "image/gif"],
    uploadDir: UPLOAD_DIR,
    routePath: "/profile/upload",
    permissionCheckError: InternalCode.UserError.Express.RealmProfileUpload_NoPermissions,
    fileNameGenerator: (req: Request) => req.headers.realm as string,
    permissionCheck: async (req: Request) => {
        const realmId = req.headers.realm as Id;
        if (!valid.id(realmId)) {
            throw new Error("realmId is missing or invalid");
        }

        const permSys = new permissionSystem(realmId);
        const userId = req.user;
        return await permSys.canUserPerformAction(userId, Permissions.admin);
    },
    postProcessCallback: async (filePath: string, req: Request) => {
        const realmId = req.headers.realm as Id;
        await db.realmConf.updateOne(realmId, { _id: "set" }, { img: true });
        global.sendToChatUsers(realmId, "refreshData", "realm.get");
    }
});

const realmImageGetterRouter = realmProfileEngine.createImageGetter(
    "/img",
    UPLOAD_DIR,
    "front/static/defaultProfile.png"
);

router.use(realmProfileEngine.getRouter());
router.use(realmImageGetterRouter);

export const path = "realm";
export default router;