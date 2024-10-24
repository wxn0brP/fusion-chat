import permissionSystem from "./permission-system/index.js";

export async function invite(userID, botID, serverID){
    const perm = new permissionSystem(serverID);
    const userPerm = await perm.userPermison(userID, "manage server");
    if(!userPerm) return { err: true, msg: "You don't have permission to edit this server" };

    const botName = await global.db.botData.findOne(botID, { _id: "name" });
    const role = await perm.createRole(botName.name);

    await global.db.botData.add(botID, { server: serverID }, false);
    await global.db.usersPerms.add(serverID, { bot: botID, roles: [role] }, false);

    return { err: false, msg: "ok" };
}