import { Router } from "express";
import FileUploadEngine from "../../profileUpload.js";
import valid from "../../../logic/validData.js";
import { canUserEditBot } from "../../../socket/dev-panel/logic/menageBot.js";
import db from "../../../dataBase.js";
const router = Router();
const UPLOAD_DIR = "userFiles/profiles";
const userProfileEngine = new FileUploadEngine({
    maxFileSize: global.fileConfig.maxBotProfileFileSize,
    allowedFileTypes: ["image/png", "image/jpeg", "image/jpg", "image/gif"],
    uploadDir: UPLOAD_DIR,
    routePath: "/upload",
    fileNameGenerator: (req) => req.headers.id,
    permissionCheck: async (req) => {
        const botId = req.headers.id;
        if (!valid.id(botId)) {
            throw new Error("botId is missing or invalid");
        }
        const userId = req.user;
        const suser = {
            _id: userId,
            name: undefined,
            email: undefined
        };
        return await canUserEditBot(suser, botId);
    },
    postProcessCallback: async (filePath, req) => {
        await db.botData.updateOneOrAdd(req.headers.id, { _id: "img" }, {});
    }
});
router.use(userProfileEngine.getRouter());
export const path = "bot/profile";
export default router;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYm90UHJvZmlsZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL2JhY2svZXhwcmVzcy9hcGkvZmlsZS9ib3RQcm9maWxlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBVyxNQUFNLEVBQUUsTUFBTSxTQUFTLENBQUM7QUFDMUMsT0FBTyxnQkFBZ0IsTUFBTSxxQkFBcUIsQ0FBQztBQUVuRCxPQUFPLEtBQUssTUFBTSxrQkFBa0IsQ0FBQztBQUNyQyxPQUFPLEVBQUUsY0FBYyxFQUFFLE1BQU0sMkNBQTJDLENBQUM7QUFDM0UsT0FBTyxFQUFFLE1BQU0sS0FBSyxDQUFDO0FBRXJCLE1BQU0sTUFBTSxHQUFHLE1BQU0sRUFBRSxDQUFDO0FBQ3hCLE1BQU0sVUFBVSxHQUFHLG9CQUFvQixDQUFDO0FBRXhDLE1BQU0saUJBQWlCLEdBQUcsSUFBSSxnQkFBZ0IsQ0FBQztJQUMzQyxXQUFXLEVBQUUsTUFBTSxDQUFDLFVBQVUsQ0FBQyxxQkFBcUI7SUFDcEQsZ0JBQWdCLEVBQUUsQ0FBQyxXQUFXLEVBQUUsWUFBWSxFQUFFLFdBQVcsRUFBRSxXQUFXLENBQUM7SUFDdkUsU0FBUyxFQUFFLFVBQVU7SUFDckIsU0FBUyxFQUFFLFNBQVM7SUFDcEIsaUJBQWlCLEVBQUUsQ0FBQyxHQUFZLEVBQUUsRUFBRSxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsRUFBWTtJQUM3RCxlQUFlLEVBQUUsS0FBSyxFQUFFLEdBQVksRUFBRSxFQUFFO1FBQ3BDLE1BQU0sS0FBSyxHQUFHLEdBQUcsQ0FBQyxPQUFPLENBQUMsRUFBUSxDQUFDO1FBQ25DLElBQUksQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUM7WUFDbkIsTUFBTSxJQUFJLEtBQUssQ0FBQyw2QkFBNkIsQ0FBQyxDQUFDO1FBQ25ELENBQUM7UUFFRCxNQUFNLE1BQU0sR0FBRyxHQUFHLENBQUMsSUFBSSxDQUFDO1FBQ3hCLE1BQU0sS0FBSyxHQUFHO1lBQ1YsR0FBRyxFQUFFLE1BQU07WUFDWCxJQUFJLEVBQUUsU0FBUztZQUNmLEtBQUssRUFBRSxTQUFTO1NBQ25CLENBQUE7UUFDRCxPQUFPLE1BQU0sY0FBYyxDQUFDLEtBQUssRUFBRSxLQUFLLENBQUMsQ0FBQztJQUM5QyxDQUFDO0lBQ0QsbUJBQW1CLEVBQUUsS0FBSyxFQUFFLFFBQWdCLEVBQUUsR0FBWSxFQUFFLEVBQUU7UUFDMUQsTUFBTSxFQUFFLENBQUMsT0FBTyxDQUFDLGNBQWMsQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLEVBQVEsRUFBRSxFQUFFLEdBQUcsRUFBRSxLQUFLLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQztJQUM5RSxDQUFDO0NBQ0osQ0FBQyxDQUFDO0FBRUgsTUFBTSxDQUFDLEdBQUcsQ0FBQyxpQkFBaUIsQ0FBQyxTQUFTLEVBQUUsQ0FBQyxDQUFDO0FBRTFDLE1BQU0sQ0FBQyxNQUFNLElBQUksR0FBRyxhQUFhLENBQUM7QUFDbEMsZUFBZSxNQUFNLENBQUMifQ==