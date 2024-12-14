import permissionSystem from "./permission-system/index.js";
import Permissions from "./permission-system/permBD.js";

export async function invite(userID, botID, realmID){
    const permSys = new permissionSystem(realmID);
    const userPerm = await permSys.canUserPerformAnyAction(userID, [
        Permissions.admin,
        Permissions.manageInvites
    ]);
    if(!userPerm) return { err: true, msg: "You don't have permission to edit this realm" };

    const botName = await global.db.botData.findOne(botID, { _id: "name" });
    const role = await permSys.createRole(botName.name);

    await global.db.botData.add(botID, { realm: realmID }, false);
    await global.db.realmUser.add(realmID, { bot: botID, roles: [role._id] }, false);

    return { err: false, msg: "ok" };
}