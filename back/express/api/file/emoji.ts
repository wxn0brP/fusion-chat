import { Router } from "express";
import multer, { memoryStorage, MulterError } from "multer";
import { writeFileSync, unlinkSync, existsSync, mkdirSync } from "fs";
import { Image } from "image-js";
import { join } from "path";
import { trace } from "potrace";
import valid from "../../../logic/validData.js";
import permissionSystem from "../../../logic/permission-system/index.js";
import Permissions from "../../../logic/permission-system/permBD.js";
import { manageRealmEmojis } from "../../../logic/emojiMgmt.js";
import db from "../../../dataBase.js";
import { Id } from "../../../types/base.js";

const router = Router();

const baseRealmPath = "userFiles/realms";
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

async function checkUserPermission(userId, realm){
    const permSys = new permissionSystem(realm);
    const userPerm = await permSys.canUserPerformAnyAction(
        userId,
        [Permissions.admin, Permissions.manageEmojis]
    );
    return userPerm;
}

async function getRealmEmoji(realmId){
    const emoji = await db.realmConf.find(realmId, { $exists: { unicode: true }});
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
                await pngFile.save(pngPath, { format: "png" });
        
                const svgPath = join(basePath, unicode.toString(16) + ".svg");
                await new Promise((resolve, reject) => {
                    trace(pngPath, (err, svg) => {
                        if(err) return reject(err);
                        writeFileSync(svgPath, svg);
                        resolve(null);
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
    const realm = req.headers.realm as Id;
    if(!realm) return res.status(400).json({ err: true, msg: "No realm id provided." });
    if(!valid.id(realm)) return res.status(400).json({ err: true, msg: "Invalid realm id." });

    try{
        const userPerm = await checkUserPermission(userId, realm);
        if(!userPerm) return res.status(403).json({ err: true, msg: "You do not have permission to do that." });
    }catch(err){
        return res.status(500).json({ err: true, msg: "You do not have permission to do that." });
    }

    const realmEmoji = await getRealmEmoji(realm);
    const realmEmojiUnicode = realmEmoji.map(emoji => emoji.unicode);

    const emojiUnicodes = generatePrivateUseArea();
    const availableUnicodes = emojiUnicodes.filter(unicode => !realmEmojiUnicode.includes(unicode));

    if(availableUnicodes.length === 0){
        return res.status(400).json({ err: true, msg: "Emoji limit reached." });
    }

    const unicode = availableUnicodes[0];
    const basePath = join(baseRealmPath, realm, "emojis");

    if(!existsSync(basePath)){
        mkdirSync(basePath, { recursive: true });
    }

    const svgPath = await uploadEmoji(basePath, unicode, req, res);
    if(!svgPath) return res.status(400).json({ err: true, msg: "An error occurred" });

    const newEmoji = {
        unicode,
        name: "new emoji",
    };

    await db.realmConf.add(realm, newEmoji, false);
    manageRealmEmojis(realm);   

    res.json({ err: false, msg: "Emoji uploaded successfully." });
});

export default router;