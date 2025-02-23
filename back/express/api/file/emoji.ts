import { Router } from "express";
import multer, { memoryStorage, MulterError } from "multer";
import { existsSync, mkdirSync } from "fs";
import { join } from "path";
import valid from "#logic/validData";
import permissionSystem from "#logic/permission-system/index";
import Permissions from "#logic/permission-system/permission";
import db from "#db";
import Id from "#id";
import InternalCode from "#codes";
import { genId } from "@wxn0brp/db";
import Db_RealmConf from "#types/db/realmConf";
import { Image } from "image-js";

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

async function checkUserPermission(userId: Id, realm: Id){
    const permSys = new permissionSystem(realm);
    const userPerm = await permSys.canUserPerformAnyAction(
        userId,
        [Permissions.admin, Permissions.manageEmojis]
    );
    return userPerm;
}

router.post("/emoji/upload", global.authenticateMiddleware, async (req, res) => {
    const userId = req.user;
    const realm = req.headers.realm as Id;
    if(!valid.id(realm)) return res.status(400).json({ err: true, c: InternalCode.UserError.Express.MissingParameters, msg: "realm" });

    try{
        const userPerm = await checkUserPermission(userId, realm);
        if(!userPerm) return res.status(403).json({
            err: true,
            c: InternalCode.UserError.Express.EmojiUpload_NoPermissions,
            msg: "You do not have permission to do that."
        });
    }catch(err){
        return res.status(500).json({ err: true, c: InternalCode.ServerError.Express.UploadError, msg: "Permission error." });
    }

    const emojisCount = await db.realmConf.find(realm, { $exists: { emoji: true } });
    // TODO add emoji count config
    if(emojisCount.length >= 100) return res.status(400).json({
        err: true,
        c: InternalCode.UserError.Express.EmojiUpload_Limit,
        msg: "You can't upload more than 100 emojis."
    });

    const basePath = join(baseRealmPath, realm, "emojis");

    if(!existsSync(basePath)){
        mkdirSync(basePath, { recursive: true });
    }

    upload(req, res, async (err) => {
        if(err){
            return res.status(400).json({ err: true, c: InternalCode.UserError.Express.UploadError, msg: err.message });
        }

        const file = (req as any).file;
        if(!file){
            return res.status(400).json({ err: true, c: InternalCode.UserError.Express.FileUpload_NoFile, msg: "No file uploaded." });
        }

        const newEmoji = {
            name: genId(),
            emoji: genId()
        }
        const filePath = join(basePath, `${newEmoji.emoji}.png`);
        
        try{
            const image = await Image.load(file.buffer);
            await image.save(filePath, { format: "png" });
        }catch(error){
            res.status(500).json({ err: true, c: InternalCode.ServerError.Express.UploadError, msg: "An error occurred while processing the file." });
            return;
        }
        
        await db.realmConf.add<Db_RealmConf.emoji>(realm, newEmoji, false);
    
        res.json({ err: false, msg: "Emoji uploaded successfully." });
    });

});

export default router;