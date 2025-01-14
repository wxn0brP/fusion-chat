import { createWriteStream, createReadStream, readFileSync, writeFileSync, existsSync, rmSync, unlinkSync } from "fs";
import { join } from "path";
import svg2ttf from "svg2ttf";
import { SVGIcons2SVGFontStream, SVGIcons2SVGFontStreamOptions } from "svgicons2svgfont";
import db from "../dataBase.js";
import { Id } from "../types/base.js";
import Db_RealmConf from "../types/db/realmConf.js";
import Logic_Emoji from "../types/logic/emoji.js";


function createSVGFont(emojis: Logic_Emoji.emoji_builder[], outputSVGFontPath: string, opts: SVGIcons2SVGFontStreamOptions){
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
                resolve(null);
            })
            .on("error", (err) => {
                console.error("Error creating font:", err);
                reject(err);
            });

        emojis.forEach((emoji) => {
            const glyphStream = createReadStream(emoji.path);
            // @ts-ignore
            // TODO fix type
            glyphStream.metadata = {
                unicode: emoji.unicode,
                name: emoji.name,
            };
            fontStream.write(glyphStream);
        });

        fontStream.end();
    });
}


function createTTF(inputSvgFontPath: string, outputTTFPath: string){
    const svgFile = readFileSync(inputSvgFontPath, "utf8");
    const ttf = svg2ttf(svgFile, {
        description: "Fusion Chat emoji font",
    });
    writeFileSync(outputTTFPath, ttf.buffer);
}

export async function createFont(emojis: Db_RealmConf.emoji[], realmId: Id){
    const basePath = join("userFiles", "realms", realmId);
    const emojiPath = join(basePath, "emojis");

    const processedEmojis: Logic_Emoji.emoji_builder[] = emojis.map(emoji => {
        const svgPath = join(emojiPath, emoji.unicode.toString(16) + ".svg");
        if(!existsSync(svgPath)) return;
        const data: Logic_Emoji.emoji_builder = {
            name: emoji.unicode.toString(16),
            unicode: [String.fromCharCode(emoji.unicode)],
            path: svgPath
        }
        return data;
    }).filter(Boolean);

    const svgFontPath = join(basePath, "emojiFont.svg");
    const ttfPath = join("userFiles", "emoji", realmId + ".ttf");

    await createSVGFont(processedEmojis, svgFontPath, {
        fontName: "FusionChatEmojiFont-" + realmId,
    } as SVGIcons2SVGFontStreamOptions);

    createTTF(svgFontPath, ttfPath);
}

export async function manageRealmEmojis(realmId: Id){
    const emojis = await db.realmConf.find<Db_RealmConf.emoji>(realmId, { $exists: { unicode: true }});
    if(emojis.length > 0){
        await createFont(emojis, realmId);
    }else{
        deleteFile(`userFiles/emoji/${realmId}.ttf`);
        deleteFile(`userFiles/realms/${realmId}/emojiFont.svg`);
        deleteDir(`userFiles/realms/${realmId}/emojis/`);
    }
}

function deleteFile(path: string){
    if(existsSync(path)) unlinkSync(path);
}

function deleteDir(path: string){
    if(existsSync(path)) rmSync(path, { recursive: true });
}