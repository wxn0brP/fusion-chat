import Id from "../types/Id";
import { updateImageSrc } from "../utils/utils";

export function reloadBotProfileImg(id?: Id) {
    const q = id ? `[data-bpi="${id}"]` : `[data-bpi]`;
    document.querySelectorAll<HTMLImageElement>(q).forEach(img => {
        updateImageSrc(img);
    });
}