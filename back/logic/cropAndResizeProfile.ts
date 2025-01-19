import Image from "image-js";

export default function cropAndResizeProfile(image: Image){
    function getTargetSize(){
        const minDimension = Math.min(image.width, image.height);
        const powersOfTwo = [512, 256, 128];
        const targetSize = powersOfTwo.find(size => minDimension >= size);
        return targetSize || 128;
    }

    const minSize = Math.min(image.width, image.height);
    const cropRegion = {
        x: (image.width - minSize) / 2,
        y: (image.height - minSize) / 2,
        width: minSize,
        height: minSize
    }

    const croppedImage = image.crop(cropRegion);
    const targetSize = getTargetSize();
    const resizedImage = croppedImage.resize({ width: targetSize, height: targetSize });
    
    return resizedImage;
}