import valid from "../../../logic/validData.js";
import ValidError from "../../../logic/validError.js";
import editSchematData from "../valid/edit.js";
import { create, KeyIndex } from "../../../logic/token/index.js";
import { genId } from "@wxn0brp/db";
import db from "../../../dataBase.js";
const editSchemat = valid.objAjv(editSchematData);

export async function bot_edit(suser, id, data){
    const validE = new ValidError("bot.edit");
    if(!valid.id(id)) return validE.valid("id");
    if(!editSchemat(data)) return validE.valid("data");

    const perm = await db.userData.findOne(suser._id, { botID: id });
    if(!perm) return validE.err("bot not found");

    await db.botData.updateOne(id, { _id: "name" }, { name: data.info.name });
    await db.botData.updateOne(id, { _id: "perm" }, { perm: data.data.perm });

    return { err: false };
}

export async function bot_get(suser, id){
    const validE = new ValidError("bot.get");
    if(!valid.id(id)) return validE.valid("id");

    const data = await db.botData.find(id, {});
    const res = {
        perm: data.find(d => d._id == "perm").perm,
    };

    return { err: false, res };
}

export async function bot_generateToken(suser, id){
    const validE = new ValidError("bot.generateToken");
    if(!valid.id(id)) return validE.valid("id");

    const perm = await db.userData.findOne(suser._id, { botID: id });
    if(!perm) return validE.err("bot not found");

    const payload = {
        rand: genId(),
        _id: id
    }
    const token = await create(payload, false, KeyIndex.BOT_TOKEN);
    await db.botData.updateOneOrAdd(id, { _id: "token" }, { token });
    return { err: false, res: token };
}