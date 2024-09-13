const router = require("express").Router();
const multer = require("multer");
const { Image } = require("image-js");
const path = require("path");
const cropAndResizeProfile = require("../../logic/cropAndResizeProfile");
const permissionSystem = require("../../logic/permission-system");

const MAX_FILE_SIZE = 1 * 1024 * 1024;
const ALLOWED_FILE_TYPES = ["image/png", "image/jpeg", "image/jpg", "image/gif"];
const UPLOAD_DIR = "userFiles/servers";

const storage = multer.memoryStorage();

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

router.post("/serverProfileUpload", global.authenticateMiddleware, async (req, res) => {
    const serverId = req.headers.serverid;
    if(!serverId) return res.status(400).json({ err: true, msg: "No server id provided." });

    const permission = new permissionSystem(serverId);
    const userId = req.user;

    const userPerm = await permission.userPermison(userId, "admin");
    if(!userPerm) return res.status(403).json({ err: true, msg: "You do not have permission to do that." });

    upload(req, res, async (err) => {
        if(err){
            return res.status(400).json({ err: true, msg: err.message });
        }

        if(!req.file){
            return res.status(400).json({ err: true, msg: "No file uploaded." });
        }

        const filePath = path.join(UPLOAD_DIR, `${serverId}.png`);

        try{
            const image = await Image.load(req.file.buffer);
            const processedImage = cropAndResizeProfile(image);
            await processedImage.save(filePath, { format: "png", compressionLevel: 0 });

            await global.db.groupSettings.updateOne(serverId, { _id: "set"}, { img: true });

            res.json({ err: false, msg: "Profile picture uploaded successfully.", path: filePath });
            global.sendToChatUsers(serverId, "refreshData", "group.get");
        }catch(error){
            res.status(500).json({ err: true, msg: "An error occurred while processing the image." });
        }
    });
});

module.exports = router;