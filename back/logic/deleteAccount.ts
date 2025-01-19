import db from "../dataBase";
import { Id } from "../types/base";

export default async (id: Id) => {
    await db.data.removeOne("user", { _id: id });
    await db.data.add("rm", { _id: id });
    await db.data.remove("fireToken", { user: id });
    
    const realms = await db.userData.find(id, { $exists: { realm: true }});
    for(const realm of realms){
        await db.realmUser.removeOne(realm.realm, { uid: id });
    }

    const bots = await db.userData.find(id, { $exists: { botID: true }});
    for(const bot of bots){
        const botRealms = await db.botData.find(bot.botID, { $exists: { realm: true }});
        for(const realm of botRealms){
            await db.realmUser.removeOne(realm.realm, { bot: bot.botID });
        }
        await db.botData.removeCollection(bot.botID);
        await db.data.add("rm", { _id: bot.botID });
    }

    await db.userData.removeCollection(id);
}