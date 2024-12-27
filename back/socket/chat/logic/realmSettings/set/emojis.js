import { manageRealmEmojis } from "../../../../../logic/emojiMgmt.js";
import { processDbChanges } from "./imports.js";
import fs from "fs";

export default async (id, data, suser, dbData) => {
    const oldEmojis = dbData.filter(d => !!d.unicode);
    const changes = processDbChanges(oldEmojis, data.emojis, ["name"], "unicode");
    await processEmojis(id, changes);
}

/**
 * Process emojis update
 */
async function processEmojis(id, changes){
    /* Note:
        changes.itemsToAdd - This array is not utilized in this function as the addition of emojis to the database is managed through an express upload endpoint elsewhere in the codebase. This function primarily handles the removal and updating of emoji entries based on the changes detected.
    */

    // Clean up removed emoji files
    const basePath = `userFiles/realms/${id}/emojis/`;
    for(const rmEmoji of changes.itemsToRemove){
        const path = `${basePath}${rmEmoji.unicode.toString(16)}.svg`;
        if(fs.existsSync(path))
            fs.unlinkSync(path);
    }

    // Remove emojis from db
    if(changes.itemsToRemove.length > 0){
        const statements = changes.itemsToRemove.map(e => ({ unicode: e.unicode }));
        await global.db.realmConf.remove(id, {
            $or: statements
        });
    }

    // Update emojis
    for(const item of changes.itemsToUpdate){
        await global.db.realmConf.updateOne(id, { unicode: item.unicode }, item);
    }

    const isEmojisChanged = 
        changes.itemsToAdd.length > 0 || 
        changes.itemsToRemove.length > 0 || 
        changes.itemsToUpdate.length > 0;

    if(!isEmojisChanged) return;
    manageRealmEmojis(id);
}