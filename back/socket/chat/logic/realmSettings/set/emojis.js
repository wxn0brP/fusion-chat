import { processDbChanges } from "./imports.js";

export default async (id, data, suser, dbData) => {
    const oldEmojis = dbData.filter(d => !!d.unicode);
    const changes = processDbChanges(oldEmojis, data.emojis, ["name"], "unicode");
    await processEmojis(id, changes);
}

/**
 * Process emojis update
 */
async function processEmojis(id, changes) {
    const isEmojisChanged = 
        changes.itemsToAdd.length > 0 || 
        changes.itemsToRemove.length > 0 || 
        changes.itemsToUpdate.length > 0;

    if (isEmojisChanged) {
        const emojis = await global.db.realmConf.find(id, { $exists: { unicode: true }});
        await emojiMgmt.createFont(emojis, id);
    }

    // Clean up removed emoji files
    const basePath = `userFiles/realms/${id}/emoji/`;
    for (const rmEmoji of changes.itemsToRemove) {
        const path = `${basePath}${rmEmoji.unicode.toString(16)}.svg`;
        if (fs.existsSync(path)) {
            fs.unlinkSync(path);
        }
    }
}