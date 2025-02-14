import { Router } from "express";
import multer, { memoryStorage } from "multer";
import { Image } from "image-js";
import { join } from "path";
import { readFileSync, existsSync } from "fs";
import cropAndResizeProfile from "../../../logic/cropAndResizeProfile";
import InternalCode from "../../../codes";

const router = Router();
const MAX_FILE_SIZE = global.fileConfig.maxUserProfileFileSize;
const ALLOWED_FILE_TYPES = ["image/png", "image/jpeg", "image/jpg", "image/gif"];
const UPLOAD_DIR = "userFiles/profiles";

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

export const path = "profile";

router.post("/upload", global.authenticateMiddleware, (req, res) => {
    upload(req, res, async (err) => {
        if(err){
            return res.status(400).json({ err: true, c: InternalCode.UserError.Express.UploadError, msg: err.message });
        }

        const ReqFile = (req as any)?.file;
        if(!ReqFile){
            return res.status(400).json({ err: true, c: InternalCode.UserError.Express.FileUpload_NoFile, msg: "No file uploaded." });
        }

        const userId = req.user;
        const filePath = join(UPLOAD_DIR, `${userId}.png`);

        try{
            const image = await Image.load(ReqFile.buffer);
            const processedImage = cropAndResizeProfile(image);
            await processedImage.save(filePath, { format: "png" });

            res.json({ err: false, msg: "Profile picture uploaded successfully.", path: filePath });
        }catch(error){
            res.status(500).json({ err: true, c: InternalCode.ServerError.Express.UploadError, msg: "An error occurred while processing the image." });
        }
    });
});

router.get("/img", (req, res) => {
    function def(){
        res.set("X-Content-Default", "true");
        res.send(readFileSync("front/static/defaultProfile.png"));
    }

    const id = req.query.id;
    if(!id) return def();

    const file = "userFiles/profiles/"+id+".png";

    if(existsSync(file)){
        res.set("X-Content-Default", "false");
        res.send(readFileSync(file));
    }else def();
});

export default router;