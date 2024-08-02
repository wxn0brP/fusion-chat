const multer = require('multer');
const { Image } = require("image-js");
const path = require('path');
const fs = require('fs');

const MAX_FILE_SIZE = 1 * 1024 * 1024;
const ALLOWED_FILE_TYPES = ['image/png', 'image/jpeg', "image/jpg", 'image/gif', 'image/webp'];
const UPLOAD_DIR = 'userFiles/profiles';

const storage = multer.memoryStorage();

const upload = multer({
    storage: storage,
    limits: { fileSize: MAX_FILE_SIZE },
    fileFilter: (req, file, cb) => {
        if(ALLOWED_FILE_TYPES.includes(file.mimetype)){
            cb(null, true);
        }else{
            cb(new Error('Invalid file type. Only PNG, JPEG, GIF, and WEBP are allowed.'));
        }
    }
}).single('file');

app.post('/profileUpload', global.authenticateMiddleware, (req, res) => {
    upload(req, res, async (err) => {
        if(err){
            return res.status(400).json({ err: true, msg: err.message });
        }

        if(!req.file){
            return res.status(400).json({ err: true, msg: 'No file uploaded.' });
        }

        const userId = req.user;
        const filePath = path.join(UPLOAD_DIR, `${userId}.png`);

        try{
            const image = await Image.load(req.file.buffer);
            const processedImage = await cropAndResize(image, 128, 128);
            await processedImage.save(filePath, { format: 'png', compressionLevel: 0 });

            res.json({ err: false, msg: 'Profile picture uploaded successfully.', path: filePath });
        }catch(error){
            res.status(500).json({ err: true, msg: 'An error occurred while processing the image.' });
        }
    });
});

app.get("/profileImg", (req, res) => {
    function def(){
        res.set("X-Content-Default", "true");
        res.send(fs.readFileSync("front/static/favicon.png"));
    }

    const id = req.query.id;
    if(!id) return def();

    const file = "userFiles/profiles/"+id+".png";

    if(fs.existsSync(file)){
        res.set("X-Content-Default", "false");
        res.send(fs.readFileSync(file));
    }else def();
});

app.get("/isProfileImg", (req, res) => {
    const id = req.query.id;
    if(!id) return res.json(false);

    const file = "userFiles/profiles/"+id+".png";
    res.json(fs.existsSync(file));
});

async function cropAndResize(image, targetWidth, targetHeight) {
    const { width: originalWidth, height: originalHeight } = image;

    const scale = Math.max(targetWidth / originalWidth, targetHeight / originalHeight);
    const newWidth = originalWidth * scale;
    const newHeight = originalHeight * scale;

    const x = (newWidth - targetWidth) / 2;
    const y = (newHeight - targetHeight) / 2;

    const scaledImage = image.resize(newWidth, newHeight);
    return scaledImage.crop(x, y, targetWidth, targetHeight);
}