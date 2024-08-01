const multer = require('multer');
const fs = require('fs');
const path = require('path');
const genId = require('../../db/gen');
const valid = require('../../logic/validData');

const config = require("../../../config/file");
const uploadDir = 'userFiles';

function separeFileName(name){
    return name.replace(/[^a-zA-Z0-9.]/g, '_');
}

const limitUploads = (req, res, next) => {
    const userDir = path.join(uploadDir, req.user);
    if(fs.existsSync(userDir)){
        const files = fs.readdirSync(userDir);
        if(files.length >= config.maxUserFiles){
            return res.status(400).json({ err: true, msg: 'File upload limit exceeded. Maximum ' + config.maxUserFiles + ' files allowed.' });
        }
    }
    next();
};

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const userDir = path.join(uploadDir, req.user);
        if(!fs.existsSync(userDir)){
            fs.mkdirSync(userDir, { recursive: true });
        }
        cb(null, userDir);
    },
    filename: (req, file, cb) => {
        const genIdValue = genId();
        const newFilename = `${genIdValue}-${separeFileName(file.originalname)}`;
        cb(null, newFilename);
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: config.maxFileSize }
}).single('file');

function deleteFile(req){
    const file = req.file;
    const filePath = path.join(file.destination, file.filename)
    fs.unlink(filePath, (err) => {
        if(!err) return;
        lo(err);
        global.db.logs.add("error", err);
    });
}

app.post('/uploadFile', global.authenticateMiddleware, limitUploads, (req, res) => {
    upload(req, res, (err) => {
        if(err){
            deleteFile(req);
            if(err instanceof multer.MulterError && err.code === 'LIMIT_FILE_SIZE'){
                return res.status(400).json({ err: true, msg: 'File size exceeds ' + config.maxFileSize/1024/1024 + 'MB limit.' });
            }
            return res.status(500).json({ err: true, msg: 'An error occurred during the file upload.' });
        }

        const file = req.file;
        const { name, size } = req.body;
        const parsedSize = parseInt(size, 10);
        
        if(!valid.str(name, 1, 60) || !valid.num(parsedSize, 0, config.maxFileSize)){
            deleteFile(req);
            return res.status(400).json({ err: true, msg: 'Invalid metadata.' });
        }

        if(file.size != parsedSize || file.originalname != name){
            deleteFile(req);
            return res.status(400).json({ err: true, msg: 'Metadata does not match the file.' });
        }

        const filePath = "/" + path.join(file.destination, file.filename);

        res.json({ err: false, msg: 'File uploaded successfully.', path: filePath });
    });
});