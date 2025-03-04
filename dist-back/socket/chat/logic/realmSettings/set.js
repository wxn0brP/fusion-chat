import valid from "../../../../logic/validData.js";
import ValidError from "../../../../logic/validError.js";
import permissionSystem from "../../../../logic/permission-system/index.js";
import Permissions, * as PermissionFunctions from "../../../../logic/permission-system/permission.js";
import setRealmSettingsData from "../../valid/realmsSettings.js";
import cpu from "./set/cpu.js";
import db from "../../../../dataBase.js";
import InternalCode from "../../../../codes/index.js";
const sect_req_perms = {
    meta: [Permissions.admin],
    categories: [Permissions.admin, Permissions.manageChannels],
    channels: [Permissions.admin, Permissions.manageChannels],
    roles: [Permissions.admin, Permissions.manageRoles],
    users: [],
    emojis: [Permissions.admin, Permissions.manageEmojis],
    webhooks: [Permissions.admin, Permissions.manageWebhooks],
    banUsers: [Permissions.admin, Permissions.banUser]
};
const db_data_req_sect = [
    "categories", "channels",
    "emojis",
    "webhooks"
];
const setRealmSettingsSchema = valid.objAjv(setRealmSettingsData);
export default async function realm_settings_set(suser, id, data) {
    const validE = new ValidError("realm.settings.set");
    if (!valid.id(id))
        return validE.valid("id");
    if (!validateData(data, setRealmSettingsSchema)) {
        return validE.valid("data", setRealmSettingsSchema.errors);
    }
    if (!await validatePermissions(suser._id, id, data)) {
        return validE.err(InternalCode.UserError.Socket.RealmSettingsSet_InsufficientPermissions);
    }
    try {
        const sections = Object.keys(data);
        const dbData = await fetchRequiredData(id, sections);
        await processAllSections(id, data, dbData, suser);
        notifyUsersAboutChanges(id, sections);
        return { err: false };
    }
    catch (error) {
        console.error("Error in realm_settings_set:", error);
        return validE.err(InternalCode.ServerError.Socket.RealmSettingsSet_Failed);
    }
}
async function validatePermissions(userId, realmId, data) {
    const permSys = new permissionSystem(realmId);
    const userPerms = await permSys.getUserPermissions(userId);
    return Object.keys(data).every(section => {
        const requiredPerms = sect_req_perms[section] || [];
        if (requiredPerms.length === 0)
            return true;
        return PermissionFunctions.hasAnyPermission(userPerms, requiredPerms);
    });
}
function validateData(data, schema) {
    if (!schema(data)) {
        if (process.env.NODE_ENV === "development") {
            lo("Validation errors:", schema.errors);
            lo("Invalid data:", data);
        }
        return false;
    }
    return true;
}
async function fetchRequiredData(id, sections) {
    if (sections.some(section => db_data_req_sect.includes(section)))
        return await db.realmConf.find(id, {});
    return null;
}
async function processAllSections(id, data, dbData, suser) {
    for (const [section, processor] of Object.entries(cpu)) {
        if (data[section]) {
            await processor(id, data, suser, dbData);
        }
    }
}
function notifyUsersAboutChanges(id, sections) {
    global.sendToChatUsers(id, "refreshData", {
        realm: id,
        evt: [
            "realm.setup",
            "realm.users.sync"
        ]
    }, id);
    if (sections.includes("meta")) {
        global.sendToChatUsers(id, "refreshData", {
            evt: "realm.get",
            wait: 1000,
        });
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2V0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vYmFjay9zb2NrZXQvY2hhdC9sb2dpYy9yZWFsbVNldHRpbmdzL3NldC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEtBQUssTUFBTSxrQkFBa0IsQ0FBQztBQUNyQyxPQUFPLFVBQVUsTUFBTSxtQkFBbUIsQ0FBQztBQUMzQyxPQUFPLGdCQUFnQixNQUFNLGdDQUFnQyxDQUFDO0FBQzlELE9BQU8sV0FBVyxFQUFFLEtBQUssbUJBQW1CLE1BQU0scUNBQXFDLENBQUM7QUFDeEYsT0FBTyxvQkFBb0IsTUFBTSw0QkFBNEIsQ0FBQztBQUM5RCxPQUFPLEdBQUcsTUFBTSxXQUFXLENBQUM7QUFDNUIsT0FBTyxFQUFFLE1BQU0sS0FBSyxDQUFDO0FBRXJCLE9BQU8sWUFBWSxNQUFNLFFBQVEsQ0FBQztBQU9sQyxNQUFNLGNBQWMsR0FBRztJQUNuQixJQUFJLEVBQUUsQ0FBQyxXQUFXLENBQUMsS0FBSyxDQUFDO0lBQ3pCLFVBQVUsRUFBRSxDQUFDLFdBQVcsQ0FBQyxLQUFLLEVBQUUsV0FBVyxDQUFDLGNBQWMsQ0FBQztJQUMzRCxRQUFRLEVBQUUsQ0FBQyxXQUFXLENBQUMsS0FBSyxFQUFFLFdBQVcsQ0FBQyxjQUFjLENBQUM7SUFDekQsS0FBSyxFQUFFLENBQUMsV0FBVyxDQUFDLEtBQUssRUFBRSxXQUFXLENBQUMsV0FBVyxDQUFDO0lBQ25ELEtBQUssRUFBRSxFQUFFO0lBQ1QsTUFBTSxFQUFFLENBQUMsV0FBVyxDQUFDLEtBQUssRUFBRSxXQUFXLENBQUMsWUFBWSxDQUFDO0lBQ3JELFFBQVEsRUFBRSxDQUFDLFdBQVcsQ0FBQyxLQUFLLEVBQUUsV0FBVyxDQUFDLGNBQWMsQ0FBQztJQUN6RCxRQUFRLEVBQUUsQ0FBQyxXQUFXLENBQUMsS0FBSyxFQUFFLFdBQVcsQ0FBQyxPQUFPLENBQUM7Q0FDNUMsQ0FBQztBQVVYLE1BQU0sZ0JBQWdCLEdBQUc7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