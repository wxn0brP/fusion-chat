import InternalCode from "#codes";
import db from "#db";
import Id from "#id";
import Db_BotData from "#types/db/botData";
import permissionSystem from "./permission-system/index";
import Permissions from "./permission-system/permission";

export async function invite(userID: Id, botID: Id, realmID: Id) {
    const permSys = new permissionSystem(realmID);
    const userPerm = await permSys.canUserPerformAnyAction(userID, [
        Permissions.admin,
        Permissions.manageInvites
    ]);
    if(!userPerm) return {
        err: true,
        c: InternalCode.UserError.Express.InviteBot_NotPermission,
        msg: "You don't have permission to edit this realm"
    };

    const botName = await db.botData.findOne<Db_BotData.name>(botID, { _id: "name" });
    const role = await permSys.createRole(botName.name);

    await db.botData.add(botID, { realm: realmID }, false);
    await db.realmUser.add(realmID, { bot: botID, r: [role._id] }, false);

    return { err: false, msg: "ok" };
}