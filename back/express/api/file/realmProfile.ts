import { Router } from "express";
import multer, { memoryStorage } from "multer";
import { Image } from "image-js";
import { join } from "path";
import cropAndResizeProfile from "#logic/cropAndResizeProfile";
import permissionSystem from "#logic/permission-system/index";
import Permissions from "#logic/permission-system/permission";
import db from "#db";
import Id from "#id";
import InternalCode from "#codes";
import valid from "#logic/validData";

const router = Router();
const MAX_FILE_SIZE = global.fileConfig.maxRealmProfileFileSize;
const ALLOWED_FILE_TYPES = ["image/png", "image/jpeg", "image/jpg", "image/gif"];
const UPLOAD_DIR = "userFiles/realms";

const storage = memoryStorage();

const upload = multer({
    storage: storage,
    limits: { fileSize: MAX_FILE_SIZE },
    fileFilter: (req, file, cb) => {
        if(ALLOWED_FILE_TYPES.includes(file.mimetype)){
            cb(null, true);
        }else{
            const formats = ALLOWED_FILE_TYPES.map(type => type.split("/")[1].toUpperCase()).join(", ");
            cb(new Error(`Invalid file type. Only ${formats} are allowed.`));
        }
    }
}).single("file");

router.post("/realm/profile/upload", global.authenticateMiddleware, async (req, res) => {
    const realmId = req.headers.realm as Id;
    if(!valid.id(realmId)) return res.status(400).json({ err: true, c: InternalCode.UserError.Express.MissingParameters, msg: "realmId." });

    const permSys = new permissionSystem(realmId);
    const userId = req.user;

    const userPerm = await permSys.canUserPerformAction(userId, Permissions.admin);
    if(!userPerm) return res.status(403).json({
        err: true,
        c: InternalCode.UserError.Express.RealmProfileUpload_NoPermissions,
        msg: "You do not have permission to do that."
    });

    upload(req, res, async (err) => {
        if(err){
            return res.status(400).json({ err: true, c: InternalCode.UserError.Express.UploadError, msg: err.message });
        }

        const ReqFile = (req as any)?.file;
        if(!ReqFile){
            return res.status(400).json({ err: true, c: InternalCode.UserError.Express.FileUpload_NoFile, msg: "No file uploaded." });
        }

        const filePath = join(UPLOAD_DIR, `${realmId}.png`);

        try{
            const image = await Image.load(ReqFile.buffer);
            const processedImage = cropAndResizeProfile(image);
            await processedImage.save(filePath, { format: "png" });

            await db.realmConf.updateOne(realmId, { _id: "set"}, { img: true });

            res.json({ err: false, msg: "Profile picture uploaded successfully.", path: filePath });
            global.sendToChatUsers(realmId, "refreshData", "realm.get");
        }catch(error){
            res.status(500).json({ err: true, c: InternalCode.ServerError.Express.UploadError, msg: "An error occurred while processing the image." });
        }
    });
});

export default router;