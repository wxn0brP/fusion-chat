import NodeCache from "node-cache";
import PermissionSystem from "./permission-system/index";
import rolePermissions, { hasPermission, getAllPermissions } from "./permission-system/permission";
import db from "#db";
import Db_RealmConf from "#types/db/realmConf";
import Id from "#id";
import getCacheSettings from "./cacheSettings";
import Logic_ChnlPerm from "#types/logic/chnlPerm";

export const cache = new NodeCache(getCacheSettings("ChnlPermission"));
export const channelPermissionsCache = new NodeCache(getCacheSettings("ChnlPermission_Channels"));

const generateCacheKey = (realm: Id, chnl: Id, userId: Id) => `${realm}:${chnl}:${userId}`;

function parseCacheKey(key: string) {
    const [realm, chnl, userId] = key.split(":");
    return { realm, chnl, userId };
}

async function fetchChannelsPermissions(realm: Id): Promise<Logic_ChnlPerm.ChannelPermissions> {
    let cachedPermissions = channelPermissionsCache.get<Logic_ChnlPerm.ChannelPermissions>(realm);
    if (cachedPermissions) return cachedPermissions;

    const channels = await db.realmConf.find<Db_RealmConf.channel>(realm, { $exists: { chid: true } });
    const permissions = channels.reduce((acc: Logic_ChnlPerm.ChannelPermissions, channel: Db_RealmConf.channel) => {
        const rp = channel.rp; // Role-permissions array
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
    }, {} as Logic_ChnlPerm.ChannelPermissions);

    channelPermissionsCache.set(realm, permissions);
    return permissions;
}

async function fetchUserRoles(realm: Id, userId: Id) {
    const permSys = new PermissionSystem(realm);
    return await permSys.getUserRolesSorted(userId);
}

class PermissionCache {
    constructor() { }

    async getPermissions(realm: Id, chnl: Id, userId: Id): Promise<number> {
        const cacheKey = generateCacheKey(realm, chnl, userId);

        let cachedPermissions = cache.get<number>(cacheKey);
        if (cachedPermissions) return cachedPermissions;

        const [channelsPermissions, userRoles] = await Promise.all([
            fetchChannelsPermissions(realm),
            fetchUserRoles(realm, userId),
        ]);

        const channelPermissions = channelsPermissions[chnl] || {};
        if (channelPermissions === "non-defined") {
            const allPerms = getAllPermissions(permissionFlags);
            cache.set(cacheKey, allPerms);
            return allPerms;
        } else {
            const userPermissions = userRoles.reduce((acc, role) => {
                const rolePermissions = channelPermissions[role._id] || 0;
                return acc | rolePermissions;
            }, 0);
            cache.set(cacheKey, userPermissions);
            return userPermissions;
        }
    }

    async getAllUserPermissions(userId: Id) {
        const keys = cache.keys().filter((key) => key.endsWith(`:${userId}`));
        const permissions = {};

        for (const key of keys) {
            const { realm, chnl } = parseCacheKey(key);
            permissions[realm] = permissions[realm] || {};
            permissions[realm][chnl] = cache.get(key);
        }

        return permissions;
    }

    async getAllRealmPermissions(realm: Id) {
        const keys = cache.keys().filter((key) => key.startsWith(`${realm}:`));
        const permissions = {};

        for (const key of keys) {
            const { chnl, userId } = parseCacheKey(key);
            permissions[chnl] = permissions[chnl] || {};
            permissions[chnl][userId] = cache.get(key);
        }

        return permissions;
    }

    async getUserPermissionsInRealm(realm: Id, userId: Id) {
        const keys = cache.keys().filter((key) => key.startsWith(`${realm}:`) && key.endsWith(`:${userId}`));
        const permissions = {};

        for (const key of keys) {
            const { chnl } = parseCacheKey(key);
            permissions[chnl] = cache.get(key);
        }

        return permissions;
    }

    async getAllChannelsInRealm(realm: Id) {
        const permissions = await fetchChannelsPermissions(realm);
        return Object.keys(permissions);
    }

    async getAllRolesInChannel(realm: Id, chnl: Id) {
        const channelsPermissions = await fetchChannelsPermissions(realm);
        return Object.keys(channelsPermissions[chnl] || {});
    }

    clearRealmCache(realm: Id) {
        const keys = cache.keys().filter((key) => key.startsWith(`${realm}:`));
        keys.forEach((key) => cache.del(key));
    }

    clearChannelCache(realm: Id, chnl: Id) {
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

export enum permissionFlags {
    view = 1 << 0,
    write = 1 << 1,
    file = 1 << 2,
    react = 1 << 3,
    threadCreate = 1 << 4,
    threadView = 1 << 5,
    threadWrite = 1 << 6,
}

type PermissionFlag = keyof typeof permissionFlags;

type Permissions = Record<PermissionFlag, boolean>;

export default async function getChnlPerm(
    user: Id,
    realm: Id,
    chnl: Id
): Promise<Permissions> {
    const cached = cache.get<number>(generateCacheKey(realm, chnl, user));
    if (cached) return mapPermissionsToFlags(cached);

    const permSys = new PermissionSystem(realm);
    const admin = await permSys.canUserPerformAction(user, rolePermissions.admin);
    const perms = admin ? -1 : await permissionCache.getPermissions(realm, chnl, user);
    return mapPermissionsToFlags(perms);
}

export function mapPermissionsToFlags(perms: number): Permissions {
    const allPerms: Permissions = {} as Permissions;
    const keys = Object.keys(permissionFlags) as PermissionFlag[];

    keys.forEach(k => {
        allPerms[k] = perms === -1 || hasPermission(perms, permissionFlags[k]);
    });

    return allPerms;
}
