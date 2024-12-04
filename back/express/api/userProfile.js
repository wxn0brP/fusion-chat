import { Router } from "express";
import multer, { memoryStorage } from "multer";
import { Image } from "image-js";
import { join } from "path";
import { readFileSync, existsSync } from "fs";
import cropAndResizeProfile from "../../logic/cropAndResizeProfile.js";

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

router.post("/profile/upload", global.authenticateMiddleware, (req, res) => {
    upload(req, res, async (err) => {
        if(err){
            return res.status(400).json({ err: true, msg: err.message });
        }

        if(!req.file){
            return res.status(400).json({ err: true, msg: "No file uploaded." });
        }

        const userId = req.user;
        const filePath = join(UPLOAD_DIR, `${userId}.png`);

        try{
            const image = await Image.load(req.file.buffer);
            const processedImage = cropAndResizeProfile(image);
            await processedImage.save(filePath, { format: "png", compressionLevel: 0 });

            res.json({ err: false, msg: "Profile picture uploaded successfully.", path: filePath });
        }catch(error){
            res.status(500).json({ err: true, msg: "An error occurred while processing the image." });
        }
    });
});

router.get("/profile/img", (req, res) => {
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