import InternalCode from "../../../codes";
import db from "../../../dataBase";
import { combineId, createChat, exitChat, createPriv, addUserToChat } from "../../../logic/chatMgmt";
import { checkIsUserOnRealm, clearCache as userInRealmClearCache } from "../../../logic/checkIsUserOnRealm";
import { clearBlockedCache, clearUserDmCache } from "../../../logic/sendMessageUtils/dm";
import valid from "../../../logic/validData";
import ValidError from "../../../logic/validError";
import { Id } from "../../../types/base";
import Db_Data from "../../../types/db/data";
import Db_Mess from "../../../types/db/mess";
import Db_RealmConf from "../../../types/db/realmConf";
import Db_UserData from "../../../types/db/userData";
import { Socket_StandardRes } from "../../../types/socket/res";
import { Socket_User } from "../../../types/socket/user";
import { friend_remove } from "./friends";
import { PermissionSystem } from "./realmSettings/set/imports";

export async function realm_get(suser: Socket_User): Promise<Socket_StandardRes> {
    const realms = await db.userData.find<Db_UserData.realm>(suser._id, r => !!r.realm);
    if (realms.length == 0) return { err: false, res: [] };

    for (let i = 0; i < realms.length; i++) {
        const realm = realms[i] as Db_UserData.realm & { img: boolean, p: number };
        const id = realm.realm;

        const realmSet = await db.realmConf.findOne<Db_RealmConf.set>(id, { _id: 'set' });
        realm.img = realmSet.img || false;

        const permSys = new PermissionSystem(realm.realm);
        const userPerm = await permSys.getUserPermissions(suser._id);
        realm.p = userPerm;
    }

    return { err: false, res: [realms] };
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

export async function realm_create(suser: Socket_User, name: string): Promise<Socket_StandardRes> {
    const validE = new ValidError("realm.create");
    if (!valid.str(name, 0, 30)) return validE.valid("name");

    createChat(name, suser._id);
    return { err: false };
}

export async function realm_exit(suser: Socket_User, id: string): Promise<Socket_StandardRes> {
    const validE = new ValidError("realm.exit");
    if (!valid.id(id)) return validE.valid("id");

    await exitChat(id, suser._id);
    global.sendToSocket(suser._id, "refreshData", "realm.get");
    userInRealmClearCache(suser._id, id);
    return { err: false };
}

export async function dm_create(suser: Socket_User, nameOrId: string): Promise<Socket_StandardRes> {
    const validE = new ValidError("dm.create");
    if (!valid.str(nameOrId, 0, 30) && !valid.id(nameOrId)) return validE.valid("nameOrId");
    if (nameOrId == suser._id || nameOrId == suser.name) return validE.err(InternalCode.UserError.Socket.Dm_CreateSelf);

    const user = await db.data.findOne<Db_Data.user>("user", {
        $or: [
            { name: nameOrId },
            { _id: nameOrId }
        ]
    });
    if (user._id == suser._id) return validE.err(InternalCode.UserError.Socket.Dm_CreateSelf);
    if (!user) return validE.err(InternalCode.UserError.Socket.Dm_UserNotFound);

    const toId = user._id;

    const priv = await db.userData.findOne(suser._id, (r) => {
        if (!r.priv) return false;
        if (r.priv == toId) return true;
    });
    if (priv) return validE.err(InternalCode.UserError.Socket.Dm_AlreadyExists);

    await createPriv(toId, suser._id);

    global.sendToSocket(suser._id, "refreshData", "dm.get");
    global.sendToSocket(toId, "refreshData", "dm.get");
    clearUserDmCache(suser._id, toId);

    return { err: false };
}

export async function realm_join(suser: Socket_User, id: Id): Promise<Socket_StandardRes> {
    const validE = new ValidError("realm.join");
    if (!valid.id(id)) return validE.valid("id");

    const exists = await db.userData.findOne(suser._id, { realm: id });
    if (exists) return validE.err(InternalCode.UserError.Socket.RealmJoin_AlreadyJoined);

    const isBaned = await db.realmData.findOne(id, { ban: suser._id });
    if (isBaned) return validE.err(InternalCode.UserError.Socket.RealmJoin_UserIsBanned);

    await addUserToChat(id, suser._id);
    global.sendToSocket(suser._id, "refreshData", "realm.get");
    userInRealmClearCache(suser._id, id);
    return { err: false };
}

export async function realm_mute(suser: Socket_User, id: Id, time: number): Promise<Socket_StandardRes> {
    const validE = new ValidError("realm.mute");
    if (!valid.id(id)) return validE.valid("id");
    if (!valid.num(time, -1)) return validE.valid("time");

    const isUserInRealm = await checkIsUserOnRealm(suser._id, id);
    if (!isUserInRealm) return validE.err(InternalCode.UserError.Socket.UserNotOnRealm);

    await db.userData.updateOne(suser._id, { realm: id }, { muted: time });
    return { err: false };
}

export async function dm_block(suser: Socket_User, id: Id, blocked: boolean): Promise<Socket_StandardRes> {
    const validE = new ValidError("dm.block");
    if (!valid.id(id)) return validE.valid("id");
    if (!valid.bool(blocked)) return validE.valid("blocked");

    if (blocked) {
        const exists = await db.userData.findOne("blocked", { fr: suser._id, to: id });
        if (exists) return validE.err(InternalCode.UserError.Socket.Dm_BlockAlreadyBlocked);

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