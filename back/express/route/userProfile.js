const multer = require('multer');
const sharp = require('sharp');
const path = require('path');

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
        const fileExtension = 'png';
        const filePath = path.join(UPLOAD_DIR, `${userId}.${fileExtension}`);

        try{
            await sharp(req.file.buffer)
                .resize(128, 128)
                .toFormat(fileExtension)
                .toFile(filePath);

            res.json({ err: false, msg: 'Profile picture uploaded successfully.', path: filePath });
        }catch(error){
            res.status(500).json({ err: true, msg: 'An error occurred while processing the image.' });
        }
    });
});