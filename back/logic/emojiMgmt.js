import { createWriteStream, createReadStream, readFileSync, writeFileSync, existsSync, rmSync, unlinkSync } from "fs";
import { join } from "path";
import svg2ttf from "svg2ttf";
import { SVGIcons2SVGFontStream } from "svgicons2svgfont";


function createSVGFont(emojis, outputSVGFontPath, opts){
    opts = {
        fontName: "FusionChatEmojiFont",
        fontHeight: 1000,
        normalize: true,
        ...opts,
    };

    return new Promise((resolve, reject) => {
        const fontStream = new SVGIcons2SVGFontStream(opts);
        const writeStream = createWriteStream(outputSVGFontPath);

        fontStream
            .pipe(writeStream)
            .on("finish", () => {
                resolve();
            })
            .on("error", (err) => {
                console.error("Error creating font:", err);
                reject(err);
            });

        emojis.forEach((emoji) => {
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

export async function createFont(emojis, realmId){
    const basePath = join("userFiles", "realms", realmId);
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
    const ttfPath = join("userFiles", "emoji", realmId + ".ttf");

    await createSVGFont(emojis, svgFontPath, {
        fontName: "FusionChatEmojiFont-" + realmId,
    });

    createTTF(svgFontPath, ttfPath);
}

export async function manageRealmEmojis(realmId){
    const emojis = await global.db.realmConf.find(realmId, { $exists: { unicode: true }});
    if(emojis.length > 0){
        await createFont(emojis, realmId);
    }else{
        deleteFile(`userFiles/emoji/${realmId}.ttf`);
        deleteFile(`userFiles/realms/${realmId}/emojiFont.svg`);
        deleteDir(`userFiles/realms/${realmId}/emojis/`);
    }
}

function deleteFile(path){
    if(existsSync(path)) unlinkSync(path);
}

function deleteDir(path){
    if(existsSync(path)) rmSync(path, { recursive: true });
}