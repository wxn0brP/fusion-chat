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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2V0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vYmFjay9zb2NrZXQvY2hhdC9sb2dpYy9yZWFsbVNldHRpbmdzL3NldC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEtBQUssTUFBTSw2QkFBNkIsQ0FBQztBQUNoRCxPQUFPLFVBQVUsTUFBTSw4QkFBOEIsQ0FBQztBQUN0RCxPQUFPLGdCQUFnQixNQUFNLDJDQUEyQyxDQUFDO0FBQ3pFLE9BQU8sV0FBVyxFQUFFLEtBQUssbUJBQW1CLE1BQU0sZ0RBQWdELENBQUM7QUFDbkcsT0FBTyxvQkFBb0IsTUFBTSw0QkFBNEIsQ0FBQztBQUM5RCxPQUFPLEdBQUcsTUFBTSxXQUFXLENBQUM7QUFDNUIsT0FBTyxFQUFFLE1BQU0sc0JBQXNCLENBQUM7QUFFdEMsT0FBTyxZQUFZLE1BQU0sbUJBQW1CLENBQUM7QUFPN0MsTUFBTSxjQUFjLEdBQUc7SUFDbkIsSUFBSSxFQUFFLENBQUMsV0FBVyxDQUFDLEtBQUssQ0FBQztJQUN6QixVQUFVLEVBQUUsQ0FBQyxXQUFXLENBQUMsS0FBSyxFQUFFLFdBQVcsQ0FBQyxjQUFjLENBQUM7SUFDM0QsUUFBUSxFQUFFLENBQUMsV0FBVyxDQUFDLEtBQUssRUFBRSxXQUFXLENBQUMsY0FBYyxDQUFDO0lBQ3pELEtBQUssRUFBRSxDQUFDLFdBQVcsQ0FBQyxLQUFLLEVBQUUsV0FBVyxDQUFDLFdBQVcsQ0FBQztJQUNuRCxLQUFLLEVBQUUsRUFBRTtJQUNULE1BQU0sRUFBRSxDQUFDLFdBQVcsQ0FBQyxLQUFLLEVBQUUsV0FBVyxDQUFDLFlBQVksQ0FBQztJQUNyRCxRQUFRLEVBQUUsQ0FBQyxXQUFXLENBQUMsS0FBSyxFQUFFLFdBQVcsQ0FBQyxjQUFjLENBQUM7SUFDekQsUUFBUSxFQUFFLENBQUMsV0FBVyxDQUFDLEtBQUssRUFBRSxXQUFXLENBQUMsT0FBTyxDQUFDO0NBQzVDLENBQUM7QUFVWCxNQUFNLGdCQUFnQixH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