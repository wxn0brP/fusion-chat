import valid from "../../../logic/validData.js";
import ValidError from "../../../logic/validError.js";

export async function status_update(suser, status, text){
    const validE = new ValidError("status.update");
    if(status && !valid.str(status, 0, 15)) return validE.valid("status", "status");
    if(text && !valid.str(text, 0, 150)) return validE.valid("text");
    
    if(!status) status = "online";
    if(!text) text = "";

    await global.db.userDatas.updateOneOrAdd(suser._id, { _id: "status" }, { status, text });
    return { err: false };
}

export async function status_get(suser){
    const status = await global.db.userDatas.findOne(suser._id, { _id: "status" });
    if(!status) return { err: false, res: ["online", ""] };
    return { err: false, res: [status.status, status.text] };
}

export async function profile_set_nickname(suser, nickname){
    const validE = new ValidError("profile.set_nickname");
    if(!valid.str(nickname, 0, 30)) return validE.valid("nickname");

    await global.db.userDatas.updateOneOrAdd(suser._id, { $exists: { nick: true }}, { nick: nickname }, {}, {}, false);
    return { err: false };
}