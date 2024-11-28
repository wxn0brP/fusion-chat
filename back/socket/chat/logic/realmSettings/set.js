import valid from "../../../../logic/validData.js";
import ValidError from "../../../../logic/validError.js";
import permissionSystem from "../../../../logic/permission-system/index.js";
import Permissions, * as PermissionFunctions from "../../../../logic/permission-system/permBD.js";
import setServerSettingsData from "../../valid/realmsSettings.js";
import cpu from "./set/cpu.js";

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

// setctions that require get db data
const db_data_req_sect = [
    "categories", "channels",
    "banUsers", "emojis",
    "webhooks"
];

const setServerSettingsSchema = valid.objAjv(setServerSettingsData);


/**
 * Updates server settings based on user input
 * @param {Object} suser - Session user object
 * @param {string} id - Realm ID
 * @param {Object} data - Settings data to update. Valid sections and properties are defined in setServerSettingsData
 * @returns {Promise<Object>} Error message on failure or confirmation of success
 */
export default async function realm_settings_set(suser, id, data){
    const validE = new ValidError("realm.settings.set");
    
    // Validate basic input
    if(!valid.id(id)) return validE.valid("id");
    if(!validateData(data, setServerSettingsSchema)){
        return validE.valid("data", setServerSettingsSchema.errors);
    }

    // Validate user permissions
    if(!await validatePermissions(suser._id, id, data)){
        return validE.err("Insufficient permissions for requested changes");
    }

    try{
        const sections = Object.keys(data);
        const dbData = await fetchRequiredData(id, sections);
        await processAllSections(id, data, dbData, suser);
        notifyUsersAboutChanges(id, sections);
        
        return { err: false };
    }catch(error){
        console.error("Error in realm_settings_set:", error);
        return validE.err("Failed to update settings");
    }
}

/**
 * Checks if a user has the required permissions to update a given section of realm settings
 * @param {string} userId - ID of the user making the request
 * @param {string} realmId - ID of the realm
 * @param {Object} data - The data being updated
 * @returns {Promise<boolean>} True if the user has the required permissions
 */
async function validatePermissions(userId, realmId, data){
    const permSys = new permissionSystem(realmId);
    const userPerms = await permSys.getUserPermissions(userId);

    return Object.keys(data).every(section => {
        const requiredPerms = sect_req_perms[section] || [];
        if(requiredPerms.length === 0) return true;
        return PermissionFunctions.hasAnyPermission(userPerms, requiredPerms);
    });
}

/**
 * Validates the given data against the provided schema.
 * Logs errors and invalid data if validation fails in a development environment.
 * 
 * @param {Object} data - The data to be validated.
 * @param {Function} schema - AJV compiled schema function to validate the data against.
 * @returns {boolean} - True if the data is valid, false otherwise.
 */
function validateData(data, schema){
    if(!schema(data)){
        if(process.env.status === "dev"){
            console.log("Validation errors:", schema.errors);
            console.log("Invalid data:", data);
        }
        return false;
    }
    return true;
}

/**
 * Fetches the required data from the database for the specified sections.
 * 
 * @param {string} id - The ID of the realm.
 * @param {string[]} sections - The sections for which data is required.
 * @returns {Promise<Object|null>} The data from the database if required sections are present, otherwise null.
 */
async function fetchRequiredData(id, sections){
    if(sections.some(section => db_data_req_sect.includes(section)))
        return await global.db.realmConf.find(id, {});
    
    return null;
}

/**
 * Processes all sections of the given data.
 * 
 * @param {string} id - The ID of the realm.
 * @param {Object} data - The data to be processed.
 * @param {Object} dbData - The data from the database.
 * @param {Object} suser - The session user object.
 */
async function processAllSections(id, data, dbData, suser){
    for(const [section, processor] of Object.entries(cpu)){
        if(data[section]){
            await processor(id, data, suser, dbData);
        }
    }
}

/**
 * Notifies users about changes made to the realm settings.
 * 
 * @param {string} id - The ID of the realm.
 * @param {string[]} sections - The sections which were changed.
 */
function notifyUsersAboutChanges(id, sections){
    global.sendToChatUsers(id, "refreshData", {
        server: id,
        evt: [
            "realm.setup",
            "realm.users.sync"
        ]
    }, id);

    if(sections.includes("meta")){
        global.sendToChatUsers(id, "refreshData", {
            evt: "realm.get",
            wait: 1000,
        });
    }
}