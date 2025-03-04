import { Router } from "express";
import multer, { diskStorage, MulterError } from "multer";
import { existsSync, readdirSync, mkdirSync } from "fs";
import { join } from "path";
import { genId } from "@wxn0brp/db";
import InternalCode from "../../../codes/index.js";
const { maxUserFiles, maxUserFileSize } = global.fileConfig;
const router = Router();
const uploadDir = "userFiles/users";
function separateFileName(name) {
    return name.replace(/[^a-zA-Z0-9.]/g, "_");
}
const limitUploads = (req, res, next) => {
    const userDir = join(uploadDir, req.user);
    if (existsSync(userDir)) {
        const files = readdirSync(userDir);
        if (files.length >= maxUserFiles) {
            return res.status(400).json({
                err: true,
                c: InternalCode.UserError.Express.UserFile_FilesLimit,
                msg: "File upload limit exceeded. Maximum " + maxUserFiles + " files allowed.",
                data: maxUserFileSize
            });
        }
    }
    next();
};
const storage = diskStorage({
    destination: (req, file, cb) => {
        const userDir = join(uploadDir, req.user);
        if (!existsSync(userDir)) {
            mkdirSync(userDir, { recursive: true });
        }
        cb(null, userDir);
    },
    filename: (req, file, cb) => {
        const genIdValue = genId();
        const newFilename = `${genIdValue}-${separateFileName(file.originalname)}`;
        cb(null, newFilename);
    }
});
const upload = multer({
    storage: storage,
    limits: { fileSize: maxUserFileSize }
}).single("file");
router.post("/file/upload", global.authenticateMiddleware, limitUploads, (req, res) => {
    upload(req, res, (err) => {
        if (err) {
            if (err instanceof MulterError && err.code === "LIMIT_FILE_SIZE") {
                return res.status(400).json({
                    err: true,
                    c: InternalCode.UserError.Express.UserFile_SizeLimit,
                    msg: "File size exceeds " + maxUserFileSize / 1024 / 1024 + "MB limit.",
                    data: maxUserFileSize
                });
            }
            return res.status(500).json({ err: true, c: InternalCode.ServerError.Express.UploadError, msg: "An error occurred during the file upload." });
        }
        const file = req.file;
        const filePath = "/" + join(file.destination, file.filename);
        res.json({ err: false, msg: "File uploaded successfully.", path: filePath });
    });
});
export default router;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXBsb2FkRmlsZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL2JhY2svZXhwcmVzcy9hcGkvZmlsZS91cGxvYWRGaWxlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxNQUFNLEVBQUUsTUFBTSxTQUFTLENBQUM7QUFDakMsT0FBTyxNQUFNLEVBQUUsRUFBRSxXQUFXLEVBQUUsV0FBVyxFQUFFLE1BQU0sUUFBUSxDQUFDO0FBQzFELE9BQU8sRUFBRSxVQUFVLEVBQUUsV0FBVyxFQUFFLFNBQVMsRUFBRSxNQUFNLElBQUksQ0FBQztBQUN4RCxPQUFPLEVBQUUsSUFBSSxFQUFFLE1BQU0sTUFBTSxDQUFDO0FBQzVCLE9BQU8sRUFBRSxLQUFLLEVBQUUsTUFBTSxhQUFhLENBQUM7QUFDcEMsT0FBTyxZQUFZLE1BQU0sUUFBUSxDQUFDO0FBRWxDLE1BQU0sRUFBRSxZQUFZLEVBQUUsZUFBZSxFQUFFLEdBQUcsTUFBTSxDQUFDLFVBQVUsQ0FBQztBQUM1RCxNQUFNLE1BQU0sR0FBRyxNQUFNLEVBQUUsQ0FBQztBQUN4QixNQUFNLFNBQVMsR0FBRyxpQkFBaUIsQ0FBQztBQUVwQyxTQUFTLGdCQUFnQixDQUFDLElBQUk7SUFDMUIsT0FBTyxJQUFJLENBQUMsT0FBTyxDQUFDLGdCQUFnQixFQUFFLEdBQUcsQ0FBQyxDQUFDO0FBQy9DLENBQUM7QUFFRCxNQUFNLFlBQVksR0FBRyxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsSUFBSSxFQUFFLEVBQUU7SUFDcEMsTUFBTSxPQUFPLEdBQUcsSUFBSSxDQUFDLFNBQVMsRUFBRSxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDMUMsSUFBRyxVQUFVLENBQUMsT0FBTyxDQUFDLEVBQUMsQ0FBQztRQUNwQixNQUFNLEtBQUssR0FBRyxXQUFXLENBQUMsT0FBTyxDQUFDLENBQUM7UUFDbkMsSUFBRyxLQUFLLENBQUMsTUFBTSxJQUFJLFlBQVksRUFBQyxDQUFDO1lB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