import { createWriteStream, createReadStream, readFileSync, writeFileSync, existsSync } from "fs";
import { join } from "path";
import svgicons2svgfont from "svgicons2svgfont";
import svg2ttf from "svg2ttf";

function createSVGFont(emojis, outputSVGFontPath, opts){
    opts = {
        fontName: "FusionChatEmojiFont",
        fontHeight: 1000,
        normalize: true,
        ...opts
    }
    return new Promise((resolve, reject) => {
        const fontStream = new svgicons2svgfont(opts);
        const writeStream = createWriteStream(outputSVGFontPath);

        fontStream.pipe(writeStream).on("finish", resolve).on("error", reject);

        emojis.forEach(emoji => {
            const glyphStream = createReadStream(emoji.path);
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
    const svgFile = readFileSync(inputSvgFontPath, "utf8");
    const ttf = svg2ttf(svgFile, {
        description: "Fusion Chat emoji font",
    });
    writeFileSync(outputTTFPath, ttf.buffer);
}

export async function createFont(emojis, serverId){
    const basePath = join("userFiles", "servers", serverId);
    const emojiPath = join(basePath, "emojis");

    emojis = emojis.map(emoji => {
        const svgPath = join(emojiPath, emoji.unicode.toString(16) + ".svg");
        if(!existsSync(svgPath)) return false;
        return {
            name: emoji.unicode.toString(16),
            unicode: [String.fromCharCode(emoji.unicode)],
            path: svgPath
        }
    }).filter(emoji => !!emoji);

    const svgFontPath = join(basePath, "emojiFont.svg");
    const ttfPath = join("userFiles", "emoji", serverId + ".ttf");

    await createSVGFont(emojis, svgFontPath, {
        fontName: "FusionChatEmojiFont-" + serverId,
    });

    createTTF(svgFontPath, ttfPath);
}