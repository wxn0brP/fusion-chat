import { Id } from "@wxn0brp/db";
import db from "../../../../../dataBase";
import { processDbChanges } from "./imports";
import fs from "fs";

export default async (id, data, suser, dbData) => {
    const oldEmojis = dbData.filter(d => !!d.emoji);
    const changes = processDbChanges(oldEmojis, data.emojis, ["name"], "emoji");
    await processEmojis(id, changes);
}

/**
 * Process emojis update
 */
async function processEmojis(id: Id, changes){
    /* Note:
        changes.itemsToAdd - This array is not utilized in this function as the addition of emojis to the database is managed through an express upload endpoint elsewhere in the codebase. This function primarily handles the removal and updating of emoji entries based on the changes detected.
    */

    // Clean up removed emoji files
    const basePath = `userFiles/realms/${id}/emojis/`;
    for(const rmEmoji of changes.itemsToRemove){
        const path = `${basePath}${rmEmoji.emoji}.png`;
        if(fs.existsSync(path))
            fs.unlinkSync(path);
    }

    // Remove emojis from db
    if(changes.itemsToRemove.length > 0){
        const statements = changes.itemsToRemove.map(e => ({ emoji: e.emoji }));
        await db.realmConf.remove(id, {
            $or: statements
        });
    }

    // Update emojis
    for(const item of changes.itemsToUpdate){
        await db.realmConf.updateOne(id, { emoji: item.emoji }, item);
    }
}