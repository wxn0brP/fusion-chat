import { Router } from "express";
import multer, { diskStorage, MulterError } from "multer";
import { existsSync, readdirSync, mkdirSync } from "fs";
import { join } from "path";
import genId from "../../db/gen.js";

const { maxUserFiles, maxFileSize } = (await import("../../../config/file.js")).default;
const router = Router();
const uploadDir = "userFiles/users";

function separeFileName(name){
    return name.replace(/[^a-zA-Z0-9.]/g, "_");
}

const limitUploads = (req, res, next) => {
    const userDir = join(uploadDir, req.user);
    if(existsSync(userDir)){
        const files = readdirSync(userDir);
        if(files.length >= maxUserFiles){
            return res.status(400).json({ err: true, msg: "File upload limit exceeded. Maximum " + maxUserFiles + " files allowed." });
        }
    }
    next();
};

const storage = diskStorage({
    destination: (req, file, cb) => {
        const userDir = join(uploadDir, req.user);
        if(!existsSync(userDir)){
            mkdirSync(userDir, { recursive: true });
        }
        cb(null, userDir);
    },
    filename: (req, file, cb) => {
        const genIdValue = genId();
        const newFilename = `${genIdValue}-${separeFileName(file.originalname)}`;
        cb(null, newFilename);
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: maxFileSize }
}).single("file");

router.post("/uploadFile", global.authenticateMiddleware, limitUploads, (req, res) => {
    upload(req, res, (err) => {
        if(err){
            if(err instanceof MulterError && err.code === "LIMIT_FILE_SIZE"){
                return res.status(400).json({ err: true, msg: "File size exceeds " + maxFileSize/1024/1024 + "MB limit." });
            }
            return res.status(500).json({ err: true, msg: "An error occurred during the file upload." });
        }

        const file = req.file;
        const filePath = "/" + join(file.destination, file.filename);

        res.json({ err: false, msg: "File uploaded successfully.", path: filePath });
    });
});

export default router;