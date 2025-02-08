import valid from "../../../logic/validData";
import ValidError from "../../../logic/validError";
import { getCache as statusMgmtGetCache } from "../../../logic/status";
import db from "../../../dataBase";
import Db_UserData from "../../../types/db/userData";
import { Socket_StandardRes } from "../../../types/socket/res";
import { Socket_User } from "../../../types/socket/user";
import emitUserStatusUpdate from "./helpers/emitUserStatusUpdate";

export async function self_status_update(suser: Socket_User, status: string, text: string): Promise<Socket_StandardRes> {
    const validE = new ValidError("self.status.update");
    if (status && !valid.str(status, 0, 15)) return validE.valid("status", "status");
    if (text && !valid.str(text, 0, 150)) return validE.valid("text");

    if (!status) status = "online";
    if (!text) text = "";

    await db.userData.updateOneOrAdd(suser._id, { _id: "status" }, { status, text });
    emitUserStatusUpdate(suser._id, status, text);
    return { err: false };
}

export async function self_status_get(suser: Socket_User): Promise<Socket_StandardRes> {
    const status = await db.userData.findOne<Db_UserData.status>(suser._id, { _id: "status" });
    const activity = await statusMgmtGetCache(suser._id);

    if (!status) return { err: false, res: ["online", "", activity] };
    return { err: false, res: [status.status, status.text, activity] };
}

export async function profile_set_nickname(suser: Socket_User, nickname: string): Promise<Socket_StandardRes> {
    const validE = new ValidError("profile.set_nickname");
    if (!valid.str(nickname, 0, 30)) return validE.valid("nickname");

    const updated = await db.userData.updateOne(suser._id, { $exists: { nick: true } }, { nick: nickname });
    if (!updated) await db.userData.add(suser._id, { nick: nickname }, false);
    return { err: false };
}