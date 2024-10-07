import valid from "../../../logic/validData.js";
import ValidError from "../../../logic/validError.js";
import genId from "../../../db/gen.js";

export async function bots_get(suser){
    const botsData = await global.db.userDatas.find(suser._id, (b) => b.botID);
    const bots = botsData.map((b) => {
        return {
            id: b.botID,
            name: b.name
        }
    });

    return bots;
}

export async function bots_delete(suser, id){
    const validE = new ValidError("bots.delete");
    if(!valid.id(id)) return validE.valid("id");

    const botExists = await global.db.userDatas.findOne(suser._id, { botID: id });
    if(!botExists) return validE.err("bot does not exist");

    await global.db.userDatas.removeOne(suser._id, { botID: id });
    await global.db.botData.removeDb(id);
    
    return { err: false };
}

export async function bots_create(suser, name){
    const validE = new ValidError("bots.create");
    if(!valid.str(name, 0, 30)) return validE.valid("name");

    const id = genId();
    await global.db.userDatas.add(suser._id, { botID: id, name }, false);
    
    await global.db.botData.checkCollection(id);
    await global.db.botData.add(id, { _id: "perm", perm: [] }, false);

    return { err: false, res: id };
}