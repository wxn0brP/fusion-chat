import InternalCode from "../../../codes/index.js";
import db from "../../../dataBase.js";
import permissionSystem from "../../../logic/permission-system/index.js";
import Permissions from "../../../logic/permission-system/permission.js";
import valid from "../../../logic/validData.js";
import { Router } from "express";
import FileUploadEngine from "../../profileUpload.js";
const router = Router();
const UPLOAD_DIR = "userFiles/realms";
const realmProfileEngine = new FileUploadEngine({
    maxFileSize: global.fileConfig.maxRealmProfileFileSize,
    allowedFileTypes: ["image/png", "image/jpeg", "image/jpg", "image/gif"],
    uploadDir: UPLOAD_DIR,
    routePath: "/profile/upload",
    permissionCheckError: InternalCode.UserError.Express.RealmProfileUpload_NoPermissions,
    fileNameGenerator: (req) => req.headers.realm,
    permissionCheck: async (req) => {
        const realmId = req.headers.realm;
        if (!valid.id(realmId)) {
            throw new Error("realmId is missing or invalid");
        }
        const permSys = new permissionSystem(realmId);
        const userId = req.user;
        return await permSys.canUserPerformAction(userId, Permissions.admin);
    },
    postProcessCallback: async (filePath, req) => {
        const realmId = req.headers.realm;
        await db.realmConf.updateOne(realmId, { _id: "set" }, { img: true });
        global.sendToChatUsers(realmId, "refreshData", "realm.get");
    }
});
const realmImageGetterRouter = realmProfileEngine.createImageGetter("/img", UPLOAD_DIR, "front/static/defaultProfile.png");
router.use(realmProfileEngine.getRouter());
router.use(realmImageGetterRouter);
export const path = "realm";
export default router;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVhbG1Qcm9maWxlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vYmFjay9leHByZXNzL2FwaS9maWxlL3JlYWxtUHJvZmlsZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLFlBQVksTUFBTSxRQUFRLENBQUM7QUFDbEMsT0FBTyxFQUFFLE1BQU0sS0FBSyxDQUFDO0FBRXJCLE9BQU8sZ0JBQWdCLE1BQU0sZ0NBQWdDLENBQUM7QUFDOUQsT0FBTyxXQUFXLE1BQU0scUNBQXFDLENBQUM7QUFDOUQsT0FBTyxLQUFLLE1BQU0sa0JBQWtCLENBQUM7QUFDckMsT0FBTyxFQUFXLE1BQU0sRUFBRSxNQUFNLFNBQVMsQ0FBQztBQUMxQyxPQUFPLGdCQUFnQixNQUFNLHFCQUFxQixDQUFDO0FBRW5ELE1BQU0sTUFBTSxHQUFHLE1BQU0sRUFBRSxDQUFDO0FBQ3hCLE1BQU0sVUFBVSxHQUFHLGtCQUFrQixDQUFDO0FBRXRDLE1BQU0sa0JBQWtCLEdBQUcsSUFBSSxnQkFBZ0IsQ0FBQztJQUM1QyxXQUFXLEVBQUUsTUFBTSxDQUFDLFVBQVUsQ0FBQyx1QkFBdUI7SUFDdEQsZ0JBQWdCLEVBQUUsQ0FBQyxXQUFXLEVBQUUsWUFBWSxFQUFFLFdBQVcsRUFBRSxXQUFXLENBQUM7SUFDdkUsU0FBUyxFQUFFLFVBQVU7SUFDckIsU0FBUyxFQUFFLGlCQUFpQjtJQUM1QixvQkFBb0IsRUFBRSxZQUFZLENBQUMsU0FBUyxDQUFDLE9BQU8sQ0FBQyxnQ0FBZ0M7SUFDckYsaUJBQWlCLEVBQUUsQ0FBQyxHQUFZLEVBQUUsRUFBRSxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsS0FBZTtJQUNoRSxlQUFlLEVBQUUsS0FBSyxFQUFFLEdBQVksRUFBRSxFQUFFO1FBQ3BDLE1BQU0sT0FBTyxHQUFHLEdBQUcsQ0FBQyxPQUFPLENBQUMsS0FBVyxDQUFDO1FBQ3hDLElBQUksQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUM7WUFDckIsTUFBTSxJQUFJLEtBQUssQ0FBQywrQkFBK0IsQ0FBQyxDQUFDO1FBQ3JELENBQUM7UUFFRCxNQUFNLE9BQU8sR0FBRyxJQUFJLGdCQUFnQixDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQzlDLE1BQU0sTUFBTSxHQUFHLEdBQUcsQ0FBQyxJQUFJLENBQUM7UUFDeEIsT0FBTyxNQUFNLE9BQU8sQ0FBQyxvQkFBb0IsQ0FBQyxNQUFNLEVBQUUsV0FBVyxDQUFDLEtBQUssQ0FBQyxDQUFDO0lBQ3pFLENBQUM7SUFDRCxtQkFBbUIsRUFBRSxLQUFLLEVBQUUsUUFBZ0IsRUFBRSxHQUFZLEVBQUUsRUFBRTtRQUMxRCxNQUFNLE9BQU8sR0FBRyxHQUFHLENBQUMsT0FBTyxDQUFDLEtBQVcsQ0FBQztRQUN4QyxNQUFNLEVBQUUsQ0FBQyxTQUFTLENBQUMsU0FBUyxDQUFDLE9BQU8sRUFBRSxFQUFFLEdBQUcsRUFBRSxLQUFLLEVBQUUsRUFBRSxFQUFFLEdBQUcsRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDO1FBQ3JFLE1BQU0sQ0FBQyxlQUFlLENBQUMsT0FBTyxFQUFFLGFBQWEsRUFBRSxXQUFXLENBQUMsQ0FBQztJQUNoRSxDQUFDO0NBQ0osQ0FBQyxDQUFDO0FBRUgsTUFBTSxzQkFBc0IsR0FBRyxrQkFBa0IsQ0FBQyxpQkFBaUIsQ0FDL0QsTUFBTSxFQUNOLFVBQVUsRUFDVixpQ0FBaUMsQ0FDcEMsQ0FBQztBQUVGLE1BQU0sQ0FBQyxHQUFHLENBQUMsa0JBQWtCLENBQUMsU0FBUyxFQUFFLENBQUMsQ0FBQztBQUMzQyxNQUFNLENBQUMsR0FBRyxDQUFDLHNCQUFzQixDQUFDLENBQUM7QUFFbkMsTUFBTSxDQUFDLE1BQU0sSUFBSSxHQUFHLE9BQU8sQ0FBQztBQUM1QixlQUFlLE1BQU0sQ0FBQyJ9