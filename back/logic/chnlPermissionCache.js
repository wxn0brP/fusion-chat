import NodeCache from "node-cache";
import PermissionSystem from "./permission-system/index.js";
import rolePermissions,{ hasPermission, getAllPermissions } from "./permission-system/permBD.js";

export const cache = new NodeCache({ stdTTL: 600, checkperiod: 120 }); // Cache TTL 10 min
export const channelPermissionsCache = new NodeCache({ stdTTL: 300, checkperiod: 60 }); // Cache TTL 5 min

const generateCacheKey = (realm, chnl, userId) => `${realm}:${chnl}:${userId}`;

function parseCacheKey(key){
    const [realm, chnl, userId] = key.split(":");
    return { realm, chnl, userId };
}

async function fetchChannelsPermissions(realm){
    let cachedPermissions = channelPermissionsCache.get(realm);
    if(cachedPermissions) return cachedPermissions;

    const channels = await global.db.realmConf.find(realm, { $exists: { chid: true } });
    const permissions = channels.reduce((acc, channel) => {
        const rp = channel.rp; // Role-permissions array
        const chnlId = channel.chid;

        if(rp.length == 0){
            acc[chnlId] = "non-defined";
            return acc;
        }

        const perms = {};
        rp.forEach((r) => {
            const [role, perm] = r.split("/");
            const p = parseInt(perm);
            perms[role] = p;
        });

        acc[chnlId] = perms;
        return acc;
    }, {});

    channelPermissionsCache.set(realm, permissions);
    return permissions;
}

async function fetchUserRoles(realm, userId){
    const permSys = new PermissionSystem(realm);
    return await permSys.getUserRolesSorted(userId);
}

class PermissionCache{
    constructor(){}

    async getPermissions(realm, chnl, userId){
        const cacheKey = generateCacheKey(realm, chnl, userId);

        let cachedPermissions = cache.get(cacheKey);
        if(cachedPermissions) return cachedPermissions;

        const [channelsPermissions, userRoles] = await Promise.all([
            fetchChannelsPermissions(realm),
            fetchUserRoles(realm, userId),
        ]);

        const channelPermissions = channelsPermissions[chnl] || {};
        if(channelPermissions === "non-defined"){
            const allPerms = getAllPermissions(permissionFlags);
            cache.set(cacheKey, allPerms);
            return allPerms;
        }else{
            const userPermissions = userRoles.reduce((acc, role) => {
                const rolePermissions = channelPermissions[role._id] || 0;
                return acc | rolePermissions;
            }, 0);
            cache.set(cacheKey, userPermissions);
            return userPermissions;
        }
    }

    async getAllUserPermissions(userId){
        const keys = cache.keys().filter((key) => key.endsWith(`:${userId}`));
        const permissions = {};

        for(const key of keys){
            const { realm, chnl } = parseCacheKey(key);
            permissions[realm] = permissions[realm] || {};
            permissions[realm][chnl] = cache.get(key);
        }

        return permissions;
    }

    async getAllRealmPermissions(realm){
        const keys = cache.keys().filter((key) => key.startsWith(`${realm}:`));
        const permissions = {};

        for(const key of keys){
            const { chnl, userId } = parseCacheKey(key);
            permissions[chnl] = permissions[chnl] || {};
            permissions[chnl][userId] = cache.get(key);
        }

        return permissions;
    }

    async getUserPermissionsInRealm(realm, userId){
        const keys = cache.keys().filter((key) => key.startsWith(`${realm}:`) && key.endsWith(`:${userId}`));
        const permissions = {};

        for(const key of keys){
            const { chnl } = parseCacheKey(key);
            permissions[chnl] = cache.get(key);
        }

        return permissions;
    }

    async getAllChannelsInRealm(realm){
        const permissions = await fetchChannelsPermissions(realm);
        return Object.keys(permissions);
    }

    async getAllRolesInChannel(realm, chnl){
        const channelsPermissions = await fetchChannelsPermissions(realm);
        return Object.keys(channelsPermissions[chnl] || {});
    }

    clearRealmCache(realm){
        const keys = cache.keys().filter((key) => key.startsWith(`${realm}:`));
        keys.forEach((key) => cache.del(key));
    }

    clearChannelCache(realm, chnl){
        const keys = cache.keys().filter((key) => key.startsWith(`${realm}:${chnl}:`));
        keys.forEach((key) => cache.del(key));
    }

    clearAllCache(){
        cache.flushAll();
        channelPermissionsCache.flushAll();
    }
}

const permissionCache = new PermissionCache();
export default permissionCache;

export const permissionFlags = Object.freeze({
    view: 1 << 0,
    write: 1 << 1,
    file: 1 << 2,
    react: 1 << 3,
});

global.getChnlPerm = async function (user, realm, chnl){
    const permSys = new PermissionSystem(realm);
    const admin = await permSys.canUserPerformAction(user, rolePermissions.admin);
    const perms = admin ? -1 : await permissionCache.getPermissions(realm, chnl, user);

    const allPerms = {};
    const keys = Object.keys(permissionFlags);
    keys.forEach(k => {
        allPerms[k] = perms === -1 || hasPermission(perms, permissionFlags[k]);
    });
    return allPerms;
}