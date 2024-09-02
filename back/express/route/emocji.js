const multer = require('multer');
const fs = require('fs');
const { Image } = require('image-js');
const svgicons2svgfont = require('svgicons2svgfont');
const svg2ttf = require('svg2ttf');
const path = require('path');
const potrace = require('potrace');

const basePath = 'userFiles/emoji';
const formats = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif'];

if(!fs.existsSync(basePath)){
    fs.mkdirSync(basePath, { recursive: true });
}

const storage = multer.memoryStorage();
const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        if(!formats.includes(file.mimetype)){
            return cb(new multer.MulterError('LIMIT_UNEXPECTED_FILE'), false);
        }
        cb(null, true);
    }
}).single('file');

const updateFontWithEmoji = async (svgPath, unicode) => {
    const fontStream = new svgicons2svgfont({
        fontName: 'custom-font',
        normalize: true,
        fontHeight: 1000,
    });

    const svgFontPath = path.join(basePath, 'font.svg');
    const writeStream = fs.createWriteStream(svgFontPath);

    fontStream.pipe(writeStream);

    const iconStream = fs.createReadStream(svgPath);
    iconStream.metadata = {
        name: unicode.toString(16),
        unicode: [`\\u${unicode.toString(16).toUpperCase()}`],
    };
    fontStream.write(iconStream);

    return new Promise((resolve, reject) => {
        fontStream.end();
        writeStream.on('finish', () => {
            const ttf = svg2ttf(fs.readFileSync(svgFontPath, 'utf8'));
            const ttfPath = path.join(basePath, `${parseInt(unicode, 16)}.ttf`);
            fs.writeFileSync(ttfPath, Buffer.from(ttf.buffer));
            resolve();
        });
        writeStream.on('error', reject);
    });
};

app.post('/uploadEmoji', upload, async (req, res) => {
    try{
        const unicode = parseInt(req.body.unicode, 16);
        const buffer = req.file.buffer;
        const pngPath = path.join(basePath, `${unicode}.png`);

        const pngFile = await Image.load(buffer);
        await pngFile.save(pngPath, { format: 'png', compressionLevel: 0 });

        const svgPath = path.join(basePath, `${unicode}.svg`);
        await new Promise((resolve, reject) => {
            potrace.trace(pngPath, (err, svg) => {
                if(err) return reject(err);
                fs.writeFileSync(svgPath, svg);
                resolve();
            });
        });

        await updateFontWithEmoji(svgPath, unicode);

        fs.unlinkSync(pngPath);
        fs.unlinkSync(svgPath);
        fs.unlinkSync(path.join(basePath, 'font.svg'));

        res.json({ err: false, msg: 'Emoji uploaded successfully' });
    }catch(err){
        console.error(err);
        res.json({ err: true, msg: 'An error occurred' });
    }
});