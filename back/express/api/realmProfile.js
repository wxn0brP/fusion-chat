import { Router } from "express";
import multer, { memoryStorage } from "multer";
import { Image } from "image-js";
import { join } from "path";
import cropAndResizeProfile from "../../logic/cropAndResizeProfile.js";
import permissionSystem from "../../logic/permission-system/index.js";
import Permissions from "../../logic/permission-system/permBD.js";

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
    const realmId = req.headers.realm;
    if(!realmId) return res.status(400).json({ err: true, msg: "No releam id provided." });

    const permSys = new permissionSystem(realmId);
    const userId = req.user;

    const userPerm = await permSys.canUserPerformAction(userId, Permissions.admin);
    if(!userPerm) return res.status(403).json({ err: true, msg: "You do not have permission to do that." });

    upload(req, res, async (err) => {
        if(err){
            return res.status(400).json({ err: true, msg: err.message });
        }

        if(!req.file){
            return res.status(400).json({ err: true, msg: "No file uploaded." });
        }

        const filePath = join(UPLOAD_DIR, `${realmId}.png`);

        try{
            const image = await Image.load(req.file.buffer);
            const processedImage = cropAndResizeProfile(image);
            await processedImage.save(filePath, { format: "png", compressionLevel: 0 });

            await global.db.realmConf.updateOne(realmId, { _id: "set"}, { img: true });

            res.json({ err: false, msg: "Profile picture uploaded successfully.", path: filePath });
            global.sendToChatUsers(realmId, "refreshData", "realm.get");
        }catch(error){
            res.status(500).json({ err: true, msg: "An error occurred while processing the image." });
        }
    });
});

export default router;