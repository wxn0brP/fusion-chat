export function updateImageSrc(img: HTMLImageElement) {
    if (!img) return;

    const url = new URL(img.src, window.location.origin);
    url.searchParams.set("t", Date.now().toString());

    img.src = url.toString();
}  