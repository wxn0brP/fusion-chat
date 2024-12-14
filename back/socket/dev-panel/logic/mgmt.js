import valid from "../../../logic/validData.js";
import ValidError from "../../../logic/validError.js";
import { genId } from "@wxn0brp/db";

export async function bots_get(suser){
    const botsData = await global.db.userData.find(suser._id, { $exists: { botID: true } });
    const botsID = botsData.map(b => b.botID);
    const botsPromises = botsID.map(async id => {
        const bot = await global.db.botData.findOne(id, { _id: "name" });
        return { id, name: bot.name };
    })

    const bots = await Promise.all(botsPromises);
    return bots;
}

export async function bots_delete(suser, id){
    const validE = new ValidError("bots.delete");
    if(!valid.id(id)) return validE.valid("id");

    const botExists = await global.db.userData.findOne(suser._id, { botID: id });
    if(!botExists) return validE.err("bot does not exist");

    const realms = await global.db.botData.find(id, { $exists: { realm: true }});
    for(const realm of realms){
        await global.db.realmUser.removeOne(realm.realm, { bot: id });
    }

    await global.db.userData.removeOne(suser._id, { botID: id });
    await global.db.botData.removeCollection(id);
    await global.db.data.add("rm", { _id: id });
    
    return { err: false };
}

export async function bots_create(suser, name){
    const validE = new ValidError("bots.create");
    if(!valid.str(name, 0, 30)) return validE.valid("name");

    const id = genId();
    await global.db.userData.add(suser._id, { botID: id }, false);
    
    await global.db.botData.checkCollection(id);
    await global.db.botData.add(id, { _id: "owner", owner: suser._id }, false);
    await global.db.botData.add(id, { _id: "name", name }, false);
    await global.db.botData.add(id, { _id: "perm", perm: [] }, false);

    return { err: false, res: id };
}