import valid from "../../../../logic/validData";
import ValidError from "../../../../logic/validError";
import permissionSystem from "../../../../logic/permission-system/index";
import Permissions, * as PermissionFunctions from "../../../../logic/permission-system/permBD";
import setRealmSettingsData from "../../valid/realmsSettings";
import cpu from "./set/cpu";
import db from "../../../../dataBase";
import { Socket_StandardRes } from "../../../../types/socket/res";
import InternalCode from "../../../../codes";
import { Socket_User } from "../../../../types/socket/user";
import { Id } from "../../../../types/base";
import { Socket_RealmSettings } from "../../../../types/socket/chat/realmSettings";
import { ValidateFunction } from "ajv";
import { Db_RealmConf } from "./set/imports";

const sect_req_perms = {
    meta: [Permissions.admin],
    categories: [Permissions.admin, Permissions.manageChannels],
    channels: [Permissions.admin, Permissions.manageChannels],
    roles: [Permissions.admin, Permissions.manageRoles],
    users: [],
    emojis: [Permissions.admin, Permissions.manageEmojis],
    webhooks: [Permissions.admin, Permissions.manageWebhooks],
    banUsers: [Permissions.admin, Permissions.banUser]
} as const;

type Section = keyof typeof sect_req_perms;

export type Settings_AllData =
    Db_RealmConf.category[] | Db_RealmConf.channel[] |
    Db_RealmConf.emoji[] |
    Db_RealmConf.webhook[];

// sections that require get db data
const db_data_req_sect = [
    "categories", "channels",
    "emojis",
    "webhooks"
];

const setRealmSettingsSchema = valid.objAjv(setRealmSettingsData);

/**
 * Updates realm settings based on user input
 * @param suser - Session user object
 * @param id - Realm ID
 * @param data - Settings data to update. Valid sections and properties are defined in setRealmSettingsData
 * @returns Error message on failure or confirmation of success
 */
export default async function realm_settings_set(suser: Socket_User, id: Id, data: Socket_RealmSettings): Promise<Socket_StandardRes> {
    const validE = new ValidError("realm.settings.set");

    // Validate basic input
    if (!valid.id(id)) return validE.valid("id");
    if (!validateData(data, setRealmSettingsSchema)) {
        return validE.valid("data", setRealmSettingsSchema.errors);
    }

    // Validate user permissions
    if (!await validatePermissions(suser._id, id, data)) {
        return validE.err(InternalCode.UserError.Socket.RealmSettingsSet_InsufficientPermissions);
    }

    try {
        const sections = Object.keys(data) as Section[];
        const dbData = await fetchRequiredData(id, sections);
        await processAllSections(id, data, dbData, suser);
        notifyUsersAboutChanges(id, sections);

        return { err: false };
    } catch (error) {
        console.error("Error in realm_settings_set:", error);
        return validE.err(InternalCode.ServerError.Socket.RealmSettingsSet_Failed);
    }
}

/**
 * Checks if a user has the required permissions to update a given section of realm settings
 * @param userId - ID of the user making the request
 * @param realmId - ID of the realm
 * @param data - The data being updated
 * @returns True if the user has the required permissions
 */
async function validatePermissions(userId: Id, realmId: Id, data: Socket_RealmSettings) {
    const permSys = new permissionSystem(realmId);
    const userPerms = await permSys.getUserPermissions(userId);

    return Object.keys(data).every(section => {
        const requiredPerms = sect_req_perms[section] || [];
        if (requiredPerms.length === 0) return true;
        return PermissionFunctions.hasAnyPermission(userPerms, requiredPerms);
    });
}

/**
 * Validates the given data against the provided schema.
 * Logs errors and invalid data if validation fails in a development environment.
 * 
 * @param data - The data to be validated.
 * @param schema - AJV compiled schema function to validate the data against.
 * @returns - True if the data is valid, false otherwise.
 */
function validateData(data: Socket_RealmSettings, schema: ValidateFunction) {
    if (!schema(data)) {
        if (process.env.NODE_ENV === "development") {
            lo("Validation errors:", schema.errors);
            lo("Invalid data:", data);
        }
        return false;
    }
    return true;
}

/**
 * Fetches the required data from the database for the specified sections.
 * 
 * @param id - The ID of the realm.
 * @param sections - The sections for which data is required.
 * @returns The data from the database if required sections are present, otherwise null.
 */
async function fetchRequiredData(id: Id, sections: Section[]) {
    if (sections.some(section => db_data_req_sect.includes(section)))
        return await db.realmConf.find<Settings_AllData>(id, {});

    return null;
}

/**
 * Processes all sections of the given data.
 * 
 * @param id - The ID of the realm.
 * @param data - The data to be processed.
 * @param dbData - The data from the database.
 * @param suser - The session user object.
 */
async function processAllSections(id: Id, data: Socket_RealmSettings, dbData: any, suser: Socket_User) {
    for (const [section, processor] of Object.entries(cpu)) {
        if (data[section]) {
            await processor(id, data, suser, dbData);
        }
    }
}

/**
 * Notifies users about changes made to the realm settings.
 * 
 * @param id - The ID of the realm.
 * @param sections - The sections which were changed.
 */
function notifyUsersAboutChanges(id: Id, sections: Section[]) {
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