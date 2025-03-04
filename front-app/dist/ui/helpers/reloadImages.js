import hub from "../../hub.js";
import utils from "../../utils/utils.js";
hub("helpers/reloadImages");
export function reloadProfileImages(id) {
    const escapedUrl = utils.escape(`/api/profile/img?id=${id}`);
    const imageSelector = `img[src*="${escapedUrl}"]`;
    const imgs = document.querySelectorAll(imageSelector);
    imgs.forEach(img => {
        const src = new URL(img.src);
        src.searchParams.set("t", new Date().getTime().toString());
        img.src = src.toString();
    });
}
//# sourceMappingURL=reloadImages.js.map