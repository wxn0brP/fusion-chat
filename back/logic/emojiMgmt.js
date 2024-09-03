const fs = require("fs");
const path = require("path");
const svgicons2svgfont = require("svgicons2svgfont");
const svg2ttf = require("svg2ttf");

function createSVGFont(emojis, outputSVGFontPath, opts){
    opts = {
        fontName: "FusionChatEmojiFont",
        fontHeight: 1000,
        normalize: true,
        ...opts
    }
    return new Promise((resolve, reject) => {
        const fontStream = new svgicons2svgfont(opts);
        const writeStream = fs.createWriteStream(outputSVGFontPath);

        fontStream.pipe(writeStream).on("finish", resolve).on("error", reject);

        emojis.forEach(emoji => {
            const glyphStream = fs.createReadStream(emoji.path);
            glyphStream.metadata = {
                unicode: emoji.unicode,
                name: emoji.name,
            };
            fontStream.write(glyphStream);
        });

        fontStream.end();
    });
}

function createTTF(inputSvgFontPath, outputTTFPath){
    const svgFile = fs.readFileSync(inputSvgFontPath, "utf8");
    const ttf = svg2ttf(svgFile, {
        description: "Fusion Chat emoji font",
    });
    fs.writeFileSync(outputTTFPath, ttf.buffer);
}

async function createFont(emojis, serverId){
    const basePath = path.join("userFiles", "servers", serverId);
    const emojiPath = path.join(basePath, "emojis");

    emojis = emojis.map(emoji => {
        const svgPath = path.join(emojiPath, emoji.unicode.toString(16) + ".svg");
        if(!fs.existsSync(svgPath)) return false;
        return {
            name: emoji.unicode.toString(16),
            unicode: [String.fromCharCode(emoji.unicode)],
            path: svgPath
        }
    }).filter(emoji => !!emoji);

    const svgFontPath = path.join(basePath, "emojiFont.svg");
    const ttfPath = path.join("userFiles", "emoji", serverId + ".ttf");

    await createSVGFont(emojis, svgFontPath, {
        fontName: "FusionChatEmojiFont-" + serverId,
    });

    createTTF(svgFontPath, ttfPath);
}

module.exports = {
    createFont,
}