import InternalCode from "#codes";
import db from "#db";
import Id from "#id";
import valid from "#logic/validData";
import ValidError from "#logic/validError";
import Db_BotData from "#types/db/botData";
import { Socket_StandardRes } from "#types/socket/res";
import { Socket_User } from "#types/socket/user";
import { genId } from "@wxn0brp/db";

export async function bots_get(suser: Socket_User): Promise<Socket_StandardRes> {
    const botsData = await db.userData.find(suser._id, { $exists: { botID: true } });
    const botsID = botsData.map(b => b.botID);
    const botsPromises = botsID.map(async id => {
        const bot = await db.botData.findOne<Db_BotData.name>(id, { _id: "name" });
        return { id, name: bot.name };
    })

    const bots = await Promise.all(botsPromises);
    return { err: false, res: [bots] };
}

export async function bots_delete(suser: Socket_User, id: Id): Promise<Socket_StandardRes> {
    const validE = new ValidError("bots.delete");
    if (!valid.id(id)) return validE.valid("id");

    const botExists = await db.userData.findOne(suser._id, { botID: id });
    if (!botExists) return validE.err(InternalCode.UserError.Socket.DevPanel_BotNotFound);

    const realms = await db.botData.find<Db_BotData.realm>(id, { $exists: { realm: true } });
    for (const realm of realms) {
        await db.realmUser.removeOne(realm.realm, { bot: id });
    }

    await db.userData.removeOne(suser._id, { botID: id });
    await db.botData.removeCollection(id);
    await db.data.add("rm", { _id: id });

    return { err: false };
}

export async function bots_create(suser: Socket_User, name: string): Promise<Socket_StandardRes> {
    const validE = new ValidError("bots.create");
    if (!valid.str(name, 0, 30)) return validE.valid("name");

    const id = genId();
    await db.userData.add(suser._id, { botID: id }, false);

    await db.botData.checkCollection(id);
    await db.botData.add(id, { _id: "owner", owner: suser._id }, false);
    await db.botData.add(id, { _id: "name", name }, false);

    return { err: false, res: [id] };
}