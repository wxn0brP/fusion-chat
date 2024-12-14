import valid from "../../../../logic/validData.js";
import ValidError from "../../../../logic/validError.js";

import permissionSystem from "../../../../logic/permission-system/index.js";
import Permissions, * as PermissionFunctions from "../../../../logic/permission-system/permBD.js";

const DEFAULT_SECTIONS = [
    "meta",
    "categories",
    "channels",
    "roles",
    "users",
    "banUsers",
    "emojis",
    "webhooks"
];

const REQUIRED_PERMISSIONS = {
    meta: [],
    categories: [Permissions.manageChannels],
    channels: [Permissions.manageChannels],
    roles: [Permissions.manageRoles],
    emojis: [Permissions.manageEmojis],
    webhooks: [Permissions.manageWebhooks],
    banUsers: [Permissions.banUser],
    users: []
};

/**
 * Get realm settings based on user permissions and requested sections
 * @param {Object} suser - Session user object
 * @param {string} id - Realm ID
 * @param {string[]} sections - Sections to retrieve
 * @returns {Promise<Object>} Settings data or error
 */
export default async function realm_settings_get(suser, id, sections=[]){
    const validator = new ValidError("realm.settings.get");
    if(!valid.id(id)) return validator.valid("id");
    if(!valid.arrayString(sections)) return validator.valid("sections");

    sections = sections.length ? sections : DEFAULT_SECTIONS;

    const permSystem = new permissionSystem(id);
    const userPerms = await permSystem.getUserPermissions(suser._id);
    
    if(!hasRequiredPermissions(userPerms)){
        return validator.err("You don't have permission to edit this server");
    }

    const data = {
        addons: {}
    };
    const dbData = await fetchRequiredData(id, sections);
    
    await Promise.all(sections.map(section => 
        processSection(section, data, dbData, userPerms, id, suser._id)
    ));

    return { err: false, res: data };
}


/**
 * Checks if a user has the required permissions to access server settings.
 * @param {number} userPerms - The user"s permissions
 * @returns {boolean} True if the user has the required permissions
 */
function hasRequiredPermissions(userPerms) {
    const requiredPerms = [
        Permissions.admin,
        Permissions.manageEmojis,
        Permissions.manageInvites,
        Permissions.manageMessages,
        Permissions.manageRoles,
        Permissions.manageWebhooks
    ];
    return PermissionFunctions.hasAnyPermission(userPerms, requiredPerms);
}

/**
 * Checks if a user has the required permissions to access a given section of data.
 * @param {number} userPerms - The user"s permissions
 * @param {number[]} requiredPerms - The required permissions for the section
 * @returns {boolean} True if the user has the required permissions
 */
function canAccessData(userPerms, requiredPerms=[]){
    return PermissionFunctions.hasAnyPermission(userPerms, [
        Permissions.admin,
        ...requiredPerms
    ]);
}

/**
 * Fetches the required data for the given sections from the database.
 * @param {string} id The id of the realm
 * @param {string[]} sections The sections to fetch data for
 * @returns {Promise<Object|null>} The data for the given sections
 */
async function fetchRequiredData(id, sections){
    const sectionsRequiringDb = ["meta", "categories", "channels", "banUsers", "emojis", "webhooks"];
    if(!sections.some(section => sectionsRequiringDb.includes(section))){
        return null;
    }
    return await global.db.realmConf.find(id, {});
}

/**
 * Process a single section of data for the realm settings
 * @param {string} section The section to process
 * @param {Object} data The data to add the section to
 * @param {Array<Object>} dbData The data from the database
 * @param {Array<string>} userPerms The permissions of the user making the request
 * @param {string} realmId The id of the realm
 * @param {string} userId The id of the user making the request
 */
async function processSection(section, data, dbData, userPerms, realmId, userId){
    if(!canAccessData(userPerms, REQUIRED_PERMISSIONS[section])){
        return;
    }

    switch(section){
        case "meta":
            const metaData = dbData.find(d => d._id === "set");
            if(metaData) {
                const { _id, ...meta } = metaData;
                data.meta = meta;
            }
        break;
        case "categories":
            data.categories = dbData.filter(d => !!d.cid);
        break;
        case "channels":
            data.channels = dbData.filter(d => !!d.chid);
            data.addons.subscribedChannels = await getSubscribedChannels(realmId);
        break;
        case "roles":
            data.roles = await getAdjustedRoles(realmId, userId);
        break;
        case "emojis":
            data.emojis = dbData.filter(d => !!d.unicode);
        break;
        case "webhooks":
            data.webhooks = dbData.filter(d => !!d.whid);
        break;  
        case "banUsers":
            data.banUsers = dbData.filter(d => !!d.ban).map(u => u.ban);
        break;
        case "users":
            const users = await global.db.realmUser.find(realmId, {});
            data.users = users.map(u => {
                let uid = u.u;
                if(u.bot) uid = "^" + u.bot;
                return { u: uid, r: u.r }
            });
        break;
    }
}

/**
 * Get all roles in a realm, with permissions adjusted to the lowest level between the role"s level and the user"s highest role level.
 * @param {string} realm - Realm ID
 * @param {string} userId - User ID
 * @returns {Promise<Object[]>} Adjusted roles
 */
async function getAdjustedRoles(realm, userId){
    const permSys = new permissionSystem(realm);
    const allRoles = await permSys.getAllRolesSorted();
    const userHighestRole = await permSys.getUserHighestRole(userId);
    const uhrl = userHighestRole.lvl;

    const adjustedData = [];
    for(const role of allRoles){
        const adjRole = { _id: role._id, lvl: role.lvl, name: role.name, p: -1, c: role.c };
        if(role.lvl >= uhrl){
            adjRole.p = role.p;
        }
        adjustedData.push(adjRole);
    }

    return adjustedData;
}

async function getSubscribedChannels(realmId){
    const channels = await global.db.realmData.find(
        "events.channels",
        { tr: realmId },
        {},
        {},
        { exclude: ["tr"]}
    )

    const realms = groupBySource(channels);
    
    for(const realm of realms){
        const names = await global.db.realmConf.find(realm.sr, {
            $or: realm.scs.map(sc => ({ chid: sc })),
        }, {}, {}, {
            select: ["chid", "name"]
        });

        channels.forEach(channel => {
            channel.name = names.find(n => n.chid == channel.sc).name;
        });
    }

    return channels;
}

/**
 * Group array of objects by source realm ID.
 * The objects should have "sr" and "sc" properties.
 * @param {Object[]} data - Array of objects to group
 * @returns {Object[]} Grouped array of objects
 * @example
 * groupBySource([{ sr: "a", sc: "b" }, { sr: "a", sc: "c" }, { sr: "d", sc: "e" }])
 * returns [{ sr: "a", scs: ["b", "c"] }, { sr: "d", scs: ["e"] }]
 */
function groupBySource(data){
    const grouped = {};

    data.forEach(({ sr, sc }) => {
        if(!grouped[sr])
            grouped[sr] = { sr, scs: [] };
        grouped[sr].scs.push(sc);
    });

    return Object.values(grouped);
}