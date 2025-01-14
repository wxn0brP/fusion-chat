import db from "../../../dataBase.js";
import { combineId, createChat, exitChat, createPriv, addUserToChat } from "../../../logic/chatMgmt.js";
import { clearBlockedCache, clearUserDmCache } from "../../../logic/sendMessageUtils/dm.js";
import valid from "../../../logic/validData.js";
import ValidError from "../../../logic/validError.js";
import { Id } from "../../../types/base.js";
import Db_Data from "../../../types/db/data.js";
import Db_Mess from "../../../types/db/mess.js";
import Db_RealmConf from "../../../types/db/realmConf.js";
import Db_UserData from "../../../types/db/userData.js";
import { Socket_StandardRes } from "../../../types/socket/res.js";
import { Socket_User } from "../../../types/socket/user.js";
import { friend_remove } from "./friends.js";

export async function realm_get(suser: Socket_User): Promise<Socket_StandardRes> {
    const realms = await db.userData.find<Db_UserData.realm>(suser._id, r => !!r.realm);
    if (realms.length == 0) return { err: false, res: [] };

    for (let i = 0; i < realms.length; i++) {
        const realm = realms[i] as Db_UserData.realm & { img: boolean };
        const realmSet = await db.realmConf.findOne<Db_RealmConf.set>(realm.realm, { _id: 'set' });
        realm.img = realmSet.img || false;
    }

    return { err: false, res: realms };
}

export async function dm_get(suser: Socket_User): Promise<Socket_StandardRes> {
    const privs = await db.userData.find<Db_UserData.priv>(suser._id, { $exists: { priv: true } });
    if (privs.length == 0) return { err: false, res: [] };

    for (let i = 0; i < privs.length; i++) {
        const priv = privs[i] as Db_UserData.priv & { lastMessId: Id };
        const id = combineId(suser._id, priv.priv);
        const lastMess = await db.mess.find<Db_Mess.Message>(id, {}, {}, { reverse: true, max: 1 });
        if (lastMess.length == 0) continue;
        priv.lastMessId = lastMess[0]._id;
    }

    const blocked =
        (await db.userData.find("blocked", {
            $or: [
                { fr: suser._id },
                { to: suser._id }
            ]
        }))
            .map(block => {
                const userIsFr = block.fr == suser._id;
                const to = userIsFr ? block.to : block.fr;
                const exists = privs.some(priv => priv.priv == to);
                if (!exists) return;

                return userIsFr ? { block: to } : { blocked: to };
            })
            .filter(Boolean);

    return { err: false, res: [privs, blocked] };
}

export async function realm_create(suser: Socket_User, name: string) {
    const validE = new ValidError("realm.create");
    if (!valid.str(name, 0, 30)) return validE.valid("name");

    createChat(name, suser._id);
    return { err: false };
}

export async function realm_exit(suser: Socket_User, id: string) {
    const validE = new ValidError("realm.exit");
    if (!valid.id(id)) return validE.valid("id");

    await exitChat(id, suser._id);
    global.sendToSocket(suser._id, "refreshData", "realm.get");
    return { err: false };
}

export async function dm_create(suser: Socket_User, nameOrId: string) {
    const validE = new ValidError("dm.create");
    if (!valid.str(nameOrId, 0, 30) && !valid.id(nameOrId)) return validE.valid("nameOrId");
    if (nameOrId == suser._id || nameOrId == suser.name) return validE.err("can't add yourself");

    const user = await db.data.findOne<Db_Data.user>("user", {
        $or: [
            { name: nameOrId },
            { _id: nameOrId }
        ]
    });
    if (user._id == suser._id) return validE.err("can't add yourself");
    if (!user) return validE.err("user does not exist");

    const toId = user._id;

    const priv = await db.userData.findOne(suser._id, (r) => {
        if (!r.priv) return false;
        if (r.priv == toId) return true;
    });
    if (priv) return validE.err("already priv");

    await createPriv(toId, suser._id);

    global.sendToSocket(suser._id, "refreshData", "dm.get");
    global.sendToSocket(toId, "refreshData", "dm.get");
    clearUserDmCache(suser._id, toId);

    return { err: false };
}

export async function realm_join(suser: Socket_User, id: Id) {
    const validE = new ValidError("realm.join");
    if (!valid.id(id)) return validE.valid("id");

    const exists = await db.userData.findOne(suser._id, { realm: id });
    if (exists) return validE.err("already in realm");

    const isBaned = await db.realmData.findOne(id, { ban: suser._id });
    if (isBaned) return validE.err("user is baned");

    await addUserToChat(id, suser._id);
    global.sendToSocket(suser._id, "refreshData", "realm.get");
    return { err: false };
}

export async function realm_mute(suser: Socket_User, id: Id, time: number) {
    const validE = new ValidError("realm.mute");
    if (!valid.id(id)) return validE.valid("id");
    if (!valid.num(time, -1)) return validE.valid("time");

    const exists = await db.userData.findOne(suser._id, { realm: id });
    if (!exists) return validE.err("not in realm");

    await db.userData.updateOne(suser._id, { realm: id }, { muted: time });
    return { err: false };
}

export async function dm_block(suser: Socket_User, id: Id, blocked: boolean) {
    const validE = new ValidError("dm.block");
    if (!valid.id(id)) return validE.valid("id");
    if (!valid.bool(blocked)) return validE.valid("blocked");

    if (blocked) {
        const exists = await db.userData.findOne("blocked", { fr: suser._id, to: id });
        if (exists) return validE.err("already blocked");

        await db.userData.add("blocked", { fr: suser._id, to: id }, false);
        await friend_remove(suser, id);
    } else {
        await db.userData.removeOne("blocked", { fr: suser._id, to: id });
    }
    clearBlockedCache(suser._id, id);

    global.sendToSocket(suser._id, "refreshData", "dm.get");
    global.sendToSocket(id, "refreshData", "dm.get");

    return { err: false };
}