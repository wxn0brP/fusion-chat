const multer = require("multer");
const fs = require("fs");
const path = require("path");
const genId = require("../../db/gen");

const config = require("../../../config/file");
const uploadDir = "userFiles/users";

function separeFileName(name){
    return name.replace(/[^a-zA-Z0-9.]/g, "_");
}

const limitUploads = (req, res, next) => {
    const userDir = path.join(uploadDir, req.user);
    if(fs.existsSync(userDir)){
        const files = fs.readdirSync(userDir);
        if(files.length >= config.maxUserFiles){
            return res.status(400).json({ err: true, msg: "File upload limit exceeded. Maximum " + config.maxUserFiles + " files allowed." });
        }
    }
    next();
};

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const userDir = path.join(uploadDir, req.user);
        if(!fs.existsSync(userDir)){
            fs.mkdirSync(userDir, { recursive: true });
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
    limits: { fileSize: config.maxFileSize }
}).single("file");

app.post("/uploadFile", global.authenticateMiddleware, limitUploads, (req, res) => {
    upload(req, res, (err) => {
        if(err){
            if(err instanceof multer.MulterError && err.code === "LIMIT_FILE_SIZE"){
                return res.status(400).json({ err: true, msg: "File size exceeds " + config.maxFileSize/1024/1024 + "MB limit." });
            }
            return res.status(500).json({ err: true, msg: "An error occurred during the file upload." });
        }

        const file = req.file;
        const filePath = "/" + path.join(file.destination, file.filename);

        res.json({ err: false, msg: "File uploaded successfully.", path: filePath });
    });
});