const permissionFlags = Object.freeze({
    admin: 1 << 0,
    manageMessages: 1 << 1,
    banUser: 1 << 2,
    muteUser: 1 << 3,
    kickUser: 1 << 4,
    manageRoles: 1 << 5,
    manageEmojis: 1 << 6,
    manageInvites: 1 << 7,
    manageWebhooks: 1 << 8,
    manageChannels: 1 << 9,
});

const permissionFunc = {
    hasAllPermissions(userPermissions, requiredPermissions){
        return requiredPermissions.every(permission => (userPermissions & permission) !== 0);
    },

    hasAnyPermission(userPermissions, requiredPermissions){
        return requiredPermissions.some(permission => (userPermissions & permission) !== 0);
    },

    canAction(permissions){
        const userPermissions = vars.user.permissions || 0;
        if(!Array.isArray(permissions)) permissions = [permissions];
        return this.hasPermission(userPermissions, permissionFlags.admin) || this.hasAnyPermission(userPermissions, permissions);
    },

    hasPermission(userPermissions, permission){
        return (userPermissions & permission) !== 0;
    },
}