import InternalCode from "../codes/index.js";
import cropAndResizeProfile from "../logic/cropAndResizeProfile.js";
import { Router } from "express";
import { existsSync, readFileSync } from "fs";
import { Image } from "image-js";
import multer, { memoryStorage } from "multer";
import { join } from "path";
class FileUploadEngine {
    config;
    router;
    constructor(config) {
        this.config = config;
        this.router = Router();
        this.setupRoutes();
    }
    setupRoutes() {
        const storage = memoryStorage();
        const upload = multer({
            storage: storage,
            limits: { fileSize: this.config.maxFileSize },
            fileFilter: (req, file, cb) => {
                if (this.config.allowedFileTypes.includes(file.mimetype)) {
                    cb(null, true);
                }
                else {
                    const formats = this.config.allowedFileTypes
                        .map(type => type.split("/")[1].toUpperCase())
                        .join(", ");
                    cb(new Error(`Invalid file type. Only ${formats} are allowed.`));
                }
            }
        }).single("file");
        this.router.post(this.config.routePath, global.authenticateMiddleware, async (req, res) => {
            if (this.config.permissionCheck) {
                const hasPermission = await this.config.permissionCheck(req);
                if (!hasPermission) {
                    return res.status(403).json({
                        err: true,
                        c: this.config.permissionCheckError || InternalCode.UserError.Express.UploadError,
                        msg: "You do not have permission to do that."
                    });
                }
            }
            upload(req, res, async (err) => {
                if (err) {
                    return res.status(400).json({
                        err: true,
                        c: InternalCode.UserError.Express.UploadError,
                        msg: err.message
                    });
                }
                const ReqFile = req?.file;
                if (!ReqFile) {
                    return res.status(400).json({
                        err: true,
                        c: InternalCode.UserError.Express.FileUpload_NoFile,
                        msg: "No file uploaded."
                    });
                }
                const fileName = this.config.fileNameGenerator(req);
                const filePath = join(this.config.uploadDir, `${fileName}.png`);
                try {
                    const image = await Image.load(ReqFile.buffer);
                    const processedImage = cropAndResizeProfile(image);
                    await processedImage.save(filePath, { format: "png" });
                    if (this.config.postProcessCallback) {
                        await this.config.postProcessCallback(filePath, req);
                    }
                    res.json({
                        err: false,
                        msg: "Profile picture uploaded successfully.",
                        path: filePath
                    });
                }
                catch (error) {
                    res.status(500).json({
                        err: true,
                        c: InternalCode.ServerError.Express.UploadError,
                        msg: "An error occurred while processing the image."
                    });
                }
            });
        });
    }
    getRouter() {
        return this.router;
    }
    createImageGetter(routePath, fileDirectory, defaultImagePath) {
        const imageRouter = Router();
        imageRouter.get(routePath, (req, res) => {
            function sendDefault() {
                res.set("X-Content-Default", "true");
                res.send(readFileSync(defaultImagePath));
            }
            const id = req.query.id;
            if (!id)
                return sendDefault();
            const file = join(fileDirectory, `${id}.png`);
            if (existsSync(file)) {
                res.set("X-Content-Default", "false");
                res.send(readFileSync(file));
            }
            else {
                sendDefault();
            }
        });
        return imageRouter;
    }
}
export default FileUploadEngine;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHJvZmlsZVVwbG9hZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL2JhY2svZXhwcmVzcy9wcm9maWxlVXBsb2FkLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sWUFBWSxNQUFNLFFBQVEsQ0FBQztBQUNsQyxPQUFPLG9CQUFvQixNQUFNLDZCQUE2QixDQUFDO0FBQy9ELE9BQU8sRUFBcUIsTUFBTSxFQUFFLE1BQU0sU0FBUyxDQUFDO0FBQ3BELE9BQU8sRUFBRSxVQUFVLEVBQUUsWUFBWSxFQUFFLE1BQU0sSUFBSSxDQUFDO0FBQzlDLE9BQU8sRUFBRSxLQUFLLEVBQUUsTUFBTSxVQUFVLENBQUM7QUFDakMsT0FBTyxNQUFNLEVBQUUsRUFBc0IsYUFBYSxFQUFFLE1BQU0sUUFBUSxDQUFDO0FBQ25FLE9BQU8sRUFBRSxJQUFJLEVBQUUsTUFBTSxNQUFNLENBQUM7QUFhNUIsTUFBTSxnQkFBZ0I7SUFDYixNQUFNLENBQW1CO0lBQ3pCLE1BQU0sQ0FBUztJQUV2QixZQUFZLE1BQXdCO1FBQ25DLElBQUksQ0FBQyxNQUFNLEdBQUcsTUFBTSxDQUFDO1FBQ3JCLElBQUksQ0FBQyxNQUFNLEdBQUcsTUFBTSxFQUFFLENBQUM7UUFDdkIsSUFBSSxDQUFDLFdBQVcsRUFBRSxDQUFDO0lBQ3BCLENBQUM7SUFFTyxXQUFXO1FBQ2xCLE1BQU0sT0FBTyxHQUFHLGFBQWEsRUFBRSxDQUFDO1FBQ2hDLE1BQU0sTUFBTSxHQUFHLE1BQU0sQ0FBQztZQUNyQixPQUFPLEVBQUUsT0FBTztZQUNoQixNQUFNLEVBQUUsRUFBRSxRQUFRLEVBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxXQUFXLEVBQUU7WUFDN0MsVUFBVSxFQUFFLENBQUMsR0FBWSxFQUFFLElBQVMsRUFBRSxFQUFzQixFQUFFLEVBQUU7Z0JBQy9ELElBQUksSUFBSSxDQUFDLE1BQU0sQ0FBQyxnQkFBZ0IsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxFQUFF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