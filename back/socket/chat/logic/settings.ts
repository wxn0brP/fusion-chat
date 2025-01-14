import valid from "../../../logic/validData.js";
import ValidError from "../../../logic/validError.js";
import { getCache as statusMgmtGetCache } from "../../../logic/status.js";
import db from "../../../dataBase.js";
import Db_UserData from "../../../types/db/userData.js";
import { Socket_StandardRes } from "../../../types/socket/res.js";
import { Socket_User } from "../../../types/socket/user.js";

export async function self_status_update(suser: Socket_User, status: string, text: string) {
    const validE = new ValidError("status.update");
    if (status && !valid.str(status, 0, 15)) return validE.valid("status", "status");
    if (text && !valid.str(text, 0, 150)) return validE.valid("text");

    if (!status) status = "online";
    if (!text) text = "";

    await db.userData.updateOneOrAdd(suser._id, { _id: "status" }, { status, text });
    return { err: false };
}

export async function self_status_get(suser: Socket_User): Promise<Socket_StandardRes> {
    const status = await db.userData.findOne<Db_UserData.status>(suser._id, { _id: "status" });
    const activity = await statusMgmtGetCache(suser._id);

    if (!status) return { err: false, res: ["online", "", activity] };
    return { err: false, res: [status.status, status.text, activity] };
}

export async function profile_set_nickname(suser: Socket_User, nickname: string) {
    const validE = new ValidError("profile.set_nickname");
    if (!valid.str(nickname, 0, 30)) return validE.valid("nickname");

    const updated = await db.userData.updateOne(suser._id, { $exists: { nick: true } }, { nick: nickname });
    if (!updated) await db.userData.add(suser._id, { nick: nickname }, false);
    return { err: false };
}