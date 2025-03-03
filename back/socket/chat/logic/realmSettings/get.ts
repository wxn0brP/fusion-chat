import valid from "#logic/validData";
import ValidError from "#logic/validError";
import permissionSystem from "#logic/permission-system/index";
import Permissions, * as PermissionFunctions from "#logic/permission-system/permission";
import db from "#db";
import Db_RealmData from "#types/db/realmData";
import Db_RealmConf from "#types/db/realmConf";
import { Socket_StandardRes } from "#types/socket/res";
import Id from "#id";
import { Socket_User } from "#types/socket/user";

const DEFAULT_SECTIONS = [
    "meta",
    "categories",
    "channels",
    "roles",
    "users",
    "banUsers",
    "emojis",
    "webhooks"
] as const;

type Section = typeof DEFAULT_SECTIONS[number];

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
 * @param suser - Session user object
 * @param id - Realm ID
 * @param sections - Sections to retrieve
 * @returns Settings data or error
 */
export default async function realm_settings_get(suser: Socket_User, id: Id, sections: Section[]=[]): Promise<Socket_StandardRes> {
    const validator = new ValidError("realm.settings.get");
    if(!valid.id(id)) return validator.valid("id");
    if(!valid.arrayString(sections)) return validator.valid("sections");

    sections = sections.length ? sections : [...DEFAULT_SECTIONS];

    const permSystem = new permissionSystem(id);
    const userPerms = await permSystem.getUserPermissions(suser._id);
    
    if(!hasRequiredPermissions(userPerms)){
        return validator.err("You don't have permission to edit this realm");
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
 * Checks if a user has the required permissions to access realm settings.
 * @param userPerms - The user"s permissions
 * @returns True if the user has the required permissions
 */
function hasRequiredPermissions(userPerms: number){
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
 * @param userPerms - The user"s permissions
 * @param requiredPerms - The required permissions for the section
 * @returns True if the user has the required permissions
 */
function canAccessData(userPerms: number, requiredPerms: Permissions[]=[]){
    return PermissionFunctions.hasAnyPermission(userPerms, [
        Permissions.admin,
        ...requiredPerms
    ]);
}

/**
 * Fetches the required data for the given sections from the database.
 * @param id The id of the realm
 * @param sections The sections to fetch data for
 * @returns The data for the given sections
 */
async function fetchRequiredData(id: Id, sections: Section[]){
    const sectionsRequiringDb = ["meta", "categories", "channels", "banUsers", "emojis", "webhooks"];
    if(!sections.some(section => sectionsRequiringDb.includes(section))){
        return null;
    }
    return await db.realmConf.find(id, {});
}

/**
 * Process a single section of data for the realm settings
 * @param section The section to process
 * @param data The data to add the section to
 * @param dbData The data from the database
 * @param userPerms The permissions of the user making the request
 * @param realmId The id of the realm
 * @param userId The id of the user making the request
 */
async function processSection(section: Section, data: any, dbData: any[], userPerms: number, realmId: Id, userId: Id){
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
            data.emojis = dbData.filter(d => !!d.emoji);
        break;
        case "webhooks":
            data.webhooks = dbData.filter(d => !!d.whid);
        break;  
        case "banUsers":
            data.banUsers = dbData.filter(d => !!d.ban).map(u => u.ban);
        break;
        case "users":
            const users = await db.realmUser.find(realmId, {});
            data.users = users.map(u => {
                let uid = u.u;
                if(u.bot) uid = "^" + u.bot;
                return { u: uid, r: u.r }
            });
        break;
        default:
            const n: never = section;
            return n;
    }
}

/**
 * Get all roles in a realm, with permissions adjusted to the lowest level between the role"s level and the user"s highest role level.
 * @param realm - Realm ID
 * @param userId - User ID
 * @returns Adjusted roles
 */
async function getAdjustedRoles(realm: Id, userId: Id){
    const permSys = new permissionSystem(realm);
    const allRoles = await permSys.getAllRolesSorted();
    const userHighestRole = await permSys.getUserHighestRole(userId);
    const highestLvl = userHighestRole.lvl;

    const adjustedData = [];
    for(const role of allRoles){
        const adjRole = { _id: role._id, lvl: role.lvl, name: role.name, p: -1, c: role.c };
        if(role.lvl >= highestLvl){
            adjRole.p = role.p;
        }
        adjustedData.push(adjRole);
    }

    return adjustedData;
}

async function getSubscribedChannels(realmId: Id){
    const channels = await db.realmData.find<Omit<Db_RealmData.announcement_channels, "tr"> & { name: string }>(
        "announcement.channels",
        { tr: realmId },
        {},
        {},
        { exclude: ["tr"]}
    );

    const realms = groupBySource(channels);
    
    for(const realm of realms){
        const names = await db.realmConf.find<Pick<Db_RealmConf.channel, "chid" | "name">>(realm.sr, {
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
 * @param data - Array of objects to group
 * @returns Grouped array of objects
 * @example
 * groupBySource([{ sr: "a", sc: "b" }, { sr: "a", sc: "c" }, { sr: "d", sc: "e" }])
 * returns [{ sr: "a", scs: ["b", "c"] }, { sr: "d", scs: ["e"] }]
 */
function groupBySource(data: Pick<Db_RealmData.announcement_channels, "sr" | "sc">[]): Array<{ sr: string; scs: string[] }> {
    const grouped: Record<string, { sr: string; scs: string[] }> = {};

    data.forEach((chnl) => {
        const { sr, sc } = chnl;
        if (!grouped[sr]) {
            grouped[sr] = { sr, scs: [] };
        }
        grouped[sr].scs.push(sc);
    });

    return Object.values(grouped);
}