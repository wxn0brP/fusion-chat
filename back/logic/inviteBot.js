import permissionSystem from "./permission-system/index.js";
import Permissions from "./permission-system/permBD.js";

export async function invite(userID, botID, serverID){
    const permSys = new permissionSystem(serverID);
    const userPerm = await permSys.canUserPerformAnyAction(userID, [
        Permissions.admin,
        Permissions.manageInvites
    ]);
    if(!userPerm) return { err: true, msg: "You don't have permission to edit this server" };

    const botName = await global.db.botData.findOne(botID, { _id: "name" });
    const role = await permSys.createRole(botName.name);

    await global.db.botData.add(botID, { server: serverID }, false);
    await global.db.realmUser.add(serverID, { bot: botID, roles: [role] }, false);

    return { err: false, msg: "ok" };
}