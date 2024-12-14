export default async (id) => {
    await global.db.data.removeOne("user", { _id: id });
    await global.db.data.add("rm", { _id: id });
    await global.db.data.remove("fireToken", { user: id });
    
    const realms = await global.db.userData.find(id, { $exists: { realm: true }});
    for(const realm of realms){
        await global.db.realmUser.removeOne(realm.realm, { uid: id });
    }

    const bots = await global.db.userData.find(id, { $exists: { botID: true }});
    for(const bot of bots){
        const botRealms = await global.db.botData.find(bot.botID, { $exists: { realm: true }});
        for(const realm of botRealms){
            await global.db.realmUser.removeOne(realm.realm, { bot: bot.botID });
        }
        await global.db.botData.removeCollection(bot.botID);
        await global.db.data.add("rm", { _id: bot.botID });
    }

    await global.db.userData.removeCollection(id);
}