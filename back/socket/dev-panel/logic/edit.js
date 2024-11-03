import valid from "../../../logic/validData.js";
import ValidError from "../../../logic/validError.js";
import editShemaData from "../valid/edit.js";
import { create, KeyIndex } from "../../../logic/token/index.js";
import genId from "@wxn0brp/db/gen.js";
const editShema = valid.objAjv(editShemaData);

export async function bot_edit(suser, id, data){
    const validE = new ValidError("bot.edit");
    if(!valid.id(id)) return validE.valid("id");
    if(!editShema(data)) return validE.valid("data");

    const perm = await global.db.userDatas.findOne(suser._id, { botID: id });
    if(!perm) return validE.err("bot not found");

    await global.db.botData.updateOne(id, { _id: "name" }, { name: data.info.name });
    await global.db.botData.updateOne(id, { _id: "perm" }, { perm: data.data.perm });

    return { err: false };
}

export async function bot_get(suser, id){
    const validE = new ValidError("bot.get");
    if(!valid.id(id)) return validE.valid("id");

    const data = await global.db.botData.find(id, {});
    const res = {
        perm: data.find(d => d._id == "perm").perm,
    };

    return { err: false, res };
}

export async function bot_generateToken(suser, id){
    const validE = new ValidError("bot.generateToken");
    if(!valid.id(id)) return validE.valid("id");

    const perm = await global.db.userDatas.findOne(suser._id, { botID: id });
    if(!perm) return validE.err("bot not found");

    const payload = {
        rand: genId(),
        _id: id
    }
    const token = await create(payload, false, KeyIndex.BOT_TOKEN);
    await global.db.botData.updateOneOrAdd(id, { _id: "token" }, { token });
    return { err: false, res: token };
}