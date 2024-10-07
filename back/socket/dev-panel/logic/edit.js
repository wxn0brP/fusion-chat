import valid from "../../../logic/validData.js";
import ValidError from "../../../logic/validError.js";
import editShemaData from "../valid/edit.js";
const editShema = valid.objAjv(editShemaData);

export async function bot_edit(suser, id, data){
    const validE = new ValidError("bot.edit");
    if(!valid.id(id)) return validE.valid("id");
    if(!editShema(data)) return validE.valid("data");

    await global.db.userDatas.updateOne(suser._id, { botID: id }, { name: data.info.name });
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