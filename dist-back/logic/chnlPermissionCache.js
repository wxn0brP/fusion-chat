import NodeCache from "node-cache";
import PermissionSystem from "./permission-system/index.js";
import rolePermissions, { hasPermission, getAllPermissions } from "./permission-system/permission.js";
import db from "../dataBase.js";
import getCacheSettings from "./cacheSettings.js";
export const cache = new NodeCache(getCacheSettings("ChnlPermission"));
export const channelPermissionsCache = new NodeCache(getCacheSettings("ChnlPermission_Channels"));
const generateCacheKey = (realm, chnl, userId) => `${realm}:${chnl}:${userId}`;
function parseCacheKey(key) {
    const [realm, chnl, userId] = key.split(":");
    return { realm, chnl, userId };
}
async function fetchChannelsPermissions(realm) {
    let cachedPermissions = channelPermissionsCache.get(realm);
    if (cachedPermissions)
        return cachedPermissions;
    const channels = await db.realmConf.find(realm, { $exists: { chid: true } });
    const permissions = channels.reduce((acc, channel) => {
        const rp = channel.rp;
        const chnlId = channel.chid;
        if (rp.length == 0) {
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
async function fetchUserRoles(realm, userId) {
    const permSys = new PermissionSystem(realm);
    return await permSys.getUserRolesSorted(userId);
}
class PermissionCache {
    constructor() { }
    async getPermissions(realm, chnl, userId) {
        const cacheKey = generateCacheKey(realm, chnl, userId);
        let cachedPermissions = cache.get(cacheKey);
        if (cachedPermissions)
            return cachedPermissions;
        const [channelsPermissions, userRoles] = await Promise.all([
            fetchChannelsPermissions(realm),
            fetchUserRoles(realm, userId),
        ]);
        const channelPermissions = channelsPermissions[chnl] || {};
        if (channelPermissions === "non-defined") {
            const allPerms = getAllPermissions(permissionFlags);
            cache.set(cacheKey, allPerms);
            return allPerms;
        }
        else {
            const userPermissions = userRoles.reduce((acc, role) => {
                const rolePermissions = channelPermissions[role._id] || 0;
                return acc | rolePermissions;
            }, 0);
            cache.set(cacheKey, userPermissions);
            return userPermissions;
        }
    }
    async getAllUserPermissions(userId) {
        const keys = cache.keys().filter((key) => key.endsWith(`:${userId}`));
        const permissions = {};
        for (const key of keys) {
            const { realm, chnl } = parseCacheKey(key);
            permissions[realm] = permissions[realm] || {};
            permissions[realm][chnl] = cache.get(key);
        }
        return permissions;
    }
    async getAllRealmPermissions(realm) {
        const keys = cache.keys().filter((key) => key.startsWith(`${realm}:`));
        const permissions = {};
        for (const key of keys) {
            const { chnl, userId } = parseCacheKey(key);
            permissions[chnl] = permissions[chnl] || {};
            permissions[chnl][userId] = cache.get(key);
        }
        return permissions;
    }
    async getUserPermissionsInRealm(realm, userId) {
        const keys = cache.keys().filter((key) => key.startsWith(`${realm}:`) && key.endsWith(`:${userId}`));
        const permissions = {};
        for (const key of keys) {
            const { chnl } = parseCacheKey(key);
            permissions[chnl] = cache.get(key);
        }
        return permissions;
    }
    async getAllChannelsInRealm(realm) {
        const permissions = await fetchChannelsPermissions(realm);
        return Object.keys(permissions);
    }
    async getAllRolesInChannel(realm, chnl) {
        const channelsPermissions = await fetchChannelsPermissions(realm);
        return Object.keys(channelsPermissions[chnl] || {});
    }
    clearRealmCache(realm) {
        const keys = cache.keys().filter((key) => key.startsWith(`${realm}:`));
        keys.forEach((key) => cache.del(key));
    }
    clearChannelCache(realm, chnl) {
        const keys = cache.keys().filter((key) => key.startsWith(`${realm}:${chnl}:`));
        keys.forEach((key) => cache.del(key));
    }
    clearAllCache() {
        cache.flushAll();
        channelPermissionsCache.flushAll();
    }
}
const permissionCache = new PermissionCache();
export { permissionCache };
export var permissionFlags;
(function (permissionFlags) {
    permissionFlags[permissionFlags["view"] = 1] = "view";
    permissionFlags[permissionFlags["write"] = 2] = "write";
    permissionFlags[permissionFlags["file"] = 4] = "file";
    permissionFlags[permissionFlags["react"] = 8] = "react";
    permissionFlags[permissionFlags["threadCreate"] = 16] = "threadCreate";
    permissionFlags[permissionFlags["threadView"] = 32] = "threadView";
    permissionFlags[permissionFlags["threadWrite"] = 64] = "threadWrite";
})(permissionFlags || (permissionFlags = {}));
export default async function getChnlPerm(user, realm, chnl) {
    const cached = cache.get(generateCacheKey(realm, chnl, user));
    if (cached)
        return mapPermissionsToFlags(cached);
    const permSys = new PermissionSystem(realm);
    const admin = await permSys.canUserPerformAction(user, rolePermissions.admin);
    const perms = admin ? -1 : await permissionCache.getPermissions(realm, chnl, user);
    return mapPermissionsToFlags(perms);
}
export function mapPermissionsToFlags(perms) {
    const allPerms = {};
    const keys = Object.keys(permissionFlags);
    keys.forEach(k => {
        allPerms[k] = perms === -1 || hasPermission(perms, permissionFlags[k]);
    });
    return allPerms;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2hubFBlcm1pc3Npb25DYWNoZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL2JhY2svbG9naWMvY2hubFBlcm1pc3Npb25DYWNoZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLFNBQVMsTUFBTSxZQUFZLENBQUM7QUFDbkMsT0FBTyxnQkFBZ0IsTUFBTSwyQkFBMkIsQ0FBQztBQUN6RCxPQUFPLGVBQWUsRUFBRSxFQUFFLGFBQWEsRUFBRSxpQkFBaUIsRUFBRSxNQUFNLGdDQUFnQyxDQUFDO0FBQ25HLE9BQU8sRUFBRSxNQUFNLEtBQUssQ0FBQztBQUdyQixPQUFPLGdCQUFnQixNQUFNLGlCQUFpQixDQUFDO0FBRy9DLE1BQU0sQ0FBQyxNQUFNLEtBQUssR0FBRyxJQUFJLFNBQVMsQ0FBQyxnQkFBZ0IsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDLENBQUM7QUFDdkUsTUFBTSxDQUFDLE1BQU0sdUJBQXVCLEdBQUcsSUFBSSxTQUFTLENBQUMsZ0JBQWdCLENBQUMseUJBQXlCLENBQUMsQ0FBQyxDQUFDO0FBRWxHLE1BQU0sZ0JBQWdCLEdBQUcsQ0FBQyxLQUFTLEVBQUUsSUFBUSxFQUFFLE1BQVUsRUFBRSxFQUFFLENBQUMsR0FBRyxLQUFLLElBQUksSUFBSSxJQUFJLE1BQU0sRUFBRSxDQUFDO0FBRTNGLFNBQVMsYUFBYSxDQUFDLEdBQVc7SUFDOUIsTUFBTSxDQUFDLEtBQUssRUFBRSxJQUFJLEVBQUUsTUFBTSxDQUFDLEdBQUcsR0FBRyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQztJQUM3QyxPQUFPLEVBQUUsS0FBSyxFQUFFLElBQUksRUFBRSxNQUFNLEVBQUUsQ0FBQztBQUNuQyxDQUFDO0FBRUQsS0FBSyxVQUFVLHdCQUF3QixDQUFDLEtBQVM7SUFDN0MsSUFBSSxpQkFBaUIsR0FBRyx1QkFBdUIsQ0FBQyxHQUFHLENBQW9DLEtBQUssQ0FBQyxDQUFDO0lBQzlGLElBQUksaUJBQWlCO1FBQUUsT0FBTyxp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