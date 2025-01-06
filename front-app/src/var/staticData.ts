import hub from "../hub";
hub("var/staticData");

const staticData = {
    baseTitle: `Fusion Chat`,
    messCount: 40,
    uploadImgTypes: ["image/png", "image/jpeg", "image/jpg", "image/gif"],
    contextmenuTags: ["img", "video", "audio", "a", "input", "textarea"],
}

export default staticData;