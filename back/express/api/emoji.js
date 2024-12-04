import { Router } from "express";
import multer, { memoryStorage, MulterError } from "multer";
import { writeFileSync, unlinkSync, existsSync, mkdirSync } from "fs";
import { Image } from "image-js";
import { join } from "path";
import { trace } from "potrace";
import valid from "../../logic/validData.js";
import permissionSystem from "../../logic/permission-system/index.js";
import Permissions from "../../logic/permission-system/permBD.js";

const router = Router();

const baseServerPath = "userFiles/realms";
const formats = ["image/png", "image/jpeg", "image/jpg", "image/gif"];

const storage = memoryStorage();
const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        if(!formats.includes(file.mimetype)){
            return cb(new MulterError("LIMIT_UNEXPECTED_FILE"), false);
        }
        cb(null, true);
    }
}).single("file");

async function checkUserPermission(userId, server){
    const permSys = new permissionSystem(server);
    const userPerm = await permSys.canUserPerformAnyAction(
        userId,
        [Permissions.admin, Permissions.manageEmojis]
    );
    return userPerm;
}

async function getServerEmoji(realmId){
    const emoji = await global.db.realmConf.find(realmId, { $exists: { unicode: true }});
    return emoji;
}

function generatePrivateUseArea(){
    const start = 0xE000;
    const end = 0xF8FF;
    const unicodeRange = [];
    for(let code=start; code<=end; code++){
        unicodeRange.push(code);
    }
    return unicodeRange;
}

function uploadEmoji(basePath, unicode, req, res){
    return new Promise((resolve, reject) => {
        upload(req, res, async (err) => {
            if(err){
                reject(err);
                return res.status(400).json({ err: true, msg: err.message });
            }
            try{
                const buffer = req.file.buffer;
                const pngPath = join(basePath, "temp.png");
        
                const pngFile = await Image.load(buffer);
                await pngFile.save(pngPath, { format: "png", compressionLevel: 0 });
        
                const svgPath = join(basePath, unicode.toString(16) + ".svg");
                await new Promise((resolve, reject) => {
                    trace(pngPath, (err, svg) => {
                        if(err) return reject(err);
                        writeFileSync(svgPath, svg);
                        resolve();
                    });
                });

                unlinkSync(pngPath);
                resolve(svgPath);
            }catch(err){
                reject(err);
                res.json({ err: true, msg: "An error occurred" });
            }
        });
    })
}

router.post("/emoji/upload", global.authenticateMiddleware, async (req, res) => {
    const userId = req.user;
    const server = req.headers.server;
    if(!server) return res.status(400).json({ err: true, msg: "No server id provided." });
    if(!valid.id(server)) return res.status(400).json({ err: true, msg: "Invalid server id." });

    try{
        const userPerm = await checkUserPermission(userId, server);
        if(!userPerm) return res.status(403).json({ err: true, msg: "You do not have permission to do that." });
    }catch(err){
        return res.status(500).json({ err: true, msg: "You do not have permission to do that." });
    }

    const serverEmoji = await getServerEmoji(server);
    const serverEmojiUnicode = serverEmoji.map(emoji => emoji.unicode);

    const emojiUnicodes = generatePrivateUseArea();
    const availablesUnicodes = emojiUnicodes.filter(unicode => !serverEmojiUnicode.includes(unicode));

    if(availablesUnicodes.length === 0){
        return res.status(400).json({ err: true, msg: "Emoji limit reached." });
    }

    const unicode = availablesUnicodes[0];
    const basePath = join(baseServerPath, server, "emojis");

    if(!existsSync(basePath)){
        mkdirSync(basePath, { recursive: true });
    }

    const svgPath = await uploadEmoji(basePath, unicode, req, res);
    if(!svgPath) return res.status(400).json({ err: true, msg: "An error occurred" });

    const newEmoji = {
        unicode,
        name: "new emoji",
    };

    await global.db.realmConf.add(server, newEmoji, false);    

    res.json({ err: false, msg: "Emoji uploaded successfully." });
});

export default router;