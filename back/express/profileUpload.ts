import InternalCode from "#codes";
import cropAndResizeProfile from "#logic/cropAndResizeProfile";
import { Request, Response, Router } from "express";
import { existsSync, readFileSync } from "fs";
import { Image } from "image-js";
import multer, { FileFilterCallback, memoryStorage } from "multer";
import { join } from "path";

interface FileUploadConfig {
	maxFileSize: number;
	allowedFileTypes: string[];
	uploadDir: string;
	routePath: string;
	fileNameGenerator: (req: Request) => string;
	postProcessCallback?: (filePath: string, req: Request) => Promise<void>;
	permissionCheck?: (req: Request) => Promise<boolean>;
	permissionCheckError?: string;
}

class FileUploadEngine {
	private config: FileUploadConfig;
	private router: Router;

	constructor(config: FileUploadConfig) {
		this.config = config;
		this.router = Router();
		this.setupRoutes();
	}

	private setupRoutes() {
		const storage = memoryStorage();
		const upload = multer({
			storage: storage,
			limits: { fileSize: this.config.maxFileSize },
			fileFilter: (req: Request, file: any, cb: FileFilterCallback) => {
				if (this.config.allowedFileTypes.includes(file.mimetype)) {
					cb(null, true);
				} else {
					const formats = this.config.allowedFileTypes
						.map(type => type.split("/")[1].toUpperCase())
						.join(", ");
					cb(new Error(`Invalid file type. Only ${formats} are allowed.`));
				}
			}
		}).single("file");

		this.router.post(this.config.routePath, global.authenticateMiddleware, async (req: Request, res: Response) => {
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

				const ReqFile = (req as any)?.file;
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
				} catch (error) {
					res.status(500).json({
						err: true,
						c: InternalCode.ServerError.Express.UploadError,
						msg: "An error occurred while processing the image."
					});
				}
			});
		});
	}

	public getRouter(): Router {
		return this.router;
	}

	public createImageGetter(routePath: string, fileDirectory: string, defaultImagePath: string): Router {
		const imageRouter = Router();

		imageRouter.get(routePath, (req, res) => {
			function sendDefault() {
				res.set("X-Content-Default", "true");
				res.send(readFileSync(defaultImagePath));
			}

			const id = req.query.id as string;
			if (!id) return sendDefault();

			const file = join(fileDirectory, `${id}.png`);

			if (existsSync(file)) {
				res.set("X-Content-Default", "false");
				res.send(readFileSync(file));
			} else {
				sendDefault();
			}
		});

		return imageRouter;
	}
}

export default FileUploadEngine;