import utils from "../../utils/utils";

export function reloadProfileImages(id: string): void {
    const escapedUrl = utils.escape(`/api/profile/img?id=${id}`);
    const imageSelector = `img[src*="${escapedUrl}"]`;
    const imgs = document.querySelectorAll<HTMLImageElement>(imageSelector);

    imgs.forEach(img => {
        const src = new URL(img.src);
        src.searchParams.set("t", new Date().getTime().toString());
        img.src = src.toString();
    });
}
