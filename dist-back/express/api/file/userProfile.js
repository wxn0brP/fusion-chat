import { Router } from "express";
import FileUploadEngine from "../../profileUpload.js";
const router = Router();
const UPLOAD_DIR = "userFiles/profiles";
const userProfileEngine = new FileUploadEngine({
    maxFileSize: global.fileConfig.maxUserProfileFileSize,
    allowedFileTypes: ["image/png", "image/jpeg", "image/jpg", "image/gif"],
    uploadDir: UPLOAD_DIR,
    routePath: "/upload",
    fileNameGenerator: (req) => req.user,
});
const imageGetterRouter = userProfileEngine.createImageGetter("/img", UPLOAD_DIR, "front/static/defaultProfile.png");
router.use(userProfileEngine.getRouter());
router.use(imageGetterRouter);
export const path = "profile";
export default router;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXNlclByb2ZpbGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9iYWNrL2V4cHJlc3MvYXBpL2ZpbGUvdXNlclByb2ZpbGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFXLE1BQU0sRUFBRSxNQUFNLFNBQVMsQ0FBQztBQUMxQyxPQUFPLGdCQUFnQixNQUFNLHFCQUFxQixDQUFDO0FBRW5ELE1BQU0sTUFBTSxHQUFHLE1BQU0sRUFBRSxDQUFDO0FBQ3hCLE1BQU0sVUFBVSxHQUFHLG9CQUFvQixDQUFDO0FBRXhDLE1BQU0saUJBQWlCLEdBQUcsSUFBSSxnQkFBZ0IsQ0FBQztJQUMzQyxXQUFXLEVBQUUsTUFBTSxDQUFDLFVBQVUsQ0FBQyxzQkFBc0I7SUFDckQsZ0JBQWdCLEVBQUUsQ0FBQyxXQUFXLEVBQUUsWUFBWSxFQUFFLFdBQVcsRUFBRSxXQUFXLENBQUM7SUFDdkUsU0FBUyxFQUFFLFVBQVU7SUFDckIsU0FBUyxFQUFFLFNBQVM7SUFDcEIsaUJBQWlCLEVBQUUsQ0FBQyxHQUFZLEVBQUUsRUFBRSxDQUFDLEdBQUcsQ0FBQyxJQUFJO0NBQ2hELENBQUMsQ0FBQztBQUVILE1BQU0saUJBQWlCLEdBQUcsaUJBQWlCLENBQUMsaUJBQWlCLENBQ3pELE1BQU0sRUFDTixVQUFVLEVBQ1YsaUNBQWlDLENBQ3BDLENBQUM7QUFFRixNQUFNLENBQUMsR0FBRyxDQUFDLGlCQUFpQixDQUFDLFNBQVMsRUFBRSxDQUFDLENBQUM7QUFDMUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO0FBRTlCLE1BQU0sQ0FBQyxNQUFNLElBQUksR0FBRyxTQUFTLENBQUM7QUFDOUIsZUFBZSxNQUFNLENBQUMifQ==