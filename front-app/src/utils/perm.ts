import hub from "../hub";
hub("perm");

import vars from "../var/var";

export enum PermissionFlags {
    Admin = 1 << 0,
    ManageMessages = 1 << 1,
    BanUser = 1 << 2,
    MuteUser = 1 << 3,
    KickUser = 1 << 4,
    ManageRoles = 1 << 5,
    ManageEmojis = 1 << 6,
    ManageInvites = 1 << 7,
    ManageWebhooks = 1 << 8,
    ManageChannels = 1 << 9,
}

const permissionFunc = {
    hasAllPermissions(userPermissions: number, requiredPermissions: number[]): boolean {
        return requiredPermissions.every(permission => (userPermissions & permission) !== 0);
    },

    hasAnyPermission(userPermissions: number, requiredPermissions: number[]): boolean {
        return requiredPermissions.some(permission => (userPermissions & permission) !== 0);
    },

    canAction(permissions: number | number[]): boolean {
        const userPermissions = vars.realm.permission || 0;
        if (!Array.isArray(permissions)) permissions = [permissions];
        return this.hasPermission(userPermissions, PermissionFlags.Admin) || this.hasAnyPermission(userPermissions, permissions);
    },

    isAdmin(): boolean {
        return this.hasPermission(vars.realm.permission || 0, PermissionFlags.Admin);
    },

    hasPermission(userPermissions: number, permission: number): boolean {
        return (userPermissions & permission) !== 0;
    },
}

export default permissionFunc;