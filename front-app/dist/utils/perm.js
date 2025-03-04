import hub from "../hub.js";
hub("perm");
import vars from "../var/var.js";
export var PermissionFlags;
(function (PermissionFlags) {
    PermissionFlags[PermissionFlags["Admin"] = 1] = "Admin";
    PermissionFlags[PermissionFlags["ManageMessages"] = 2] = "ManageMessages";
    PermissionFlags[PermissionFlags["BanUser"] = 4] = "BanUser";
    PermissionFlags[PermissionFlags["MuteUser"] = 8] = "MuteUser";
    PermissionFlags[PermissionFlags["KickUser"] = 16] = "KickUser";
    PermissionFlags[PermissionFlags["ManageRoles"] = 32] = "ManageRoles";
    PermissionFlags[PermissionFlags["ManageEmojis"] = 64] = "ManageEmojis";
    PermissionFlags[PermissionFlags["ManageInvites"] = 128] = "ManageInvites";
    PermissionFlags[PermissionFlags["ManageWebhooks"] = 256] = "ManageWebhooks";
    PermissionFlags[PermissionFlags["ManageChannels"] = 512] = "ManageChannels";
})(PermissionFlags || (PermissionFlags = {}));
const permissionFunc = {
    hasAllPermissions(userPermissions, requiredPermissions) {
        return requiredPermissions.every(permission => (userPermissions & permission) !== 0);
    },
    hasAnyPermission(userPermissions, requiredPermissions) {
        return requiredPermissions.some(permission => (userPermissions & permission) !== 0);
    },
    canAction(permissions) {
        const userPermissions = vars.realm.permission || 0;
        if (!Array.isArray(permissions))
            permissions = [permissions];
        return this.hasPermission(userPermissions, PermissionFlags.Admin) || this.hasAnyPermission(userPermissions, permissions);
    },
    isAdmin() {
        return this.hasPermission(vars.realm.permission || 0, PermissionFlags.Admin);
    },
    hasPermission(userPermissions, permission) {
        return (userPermissions & permission) !== 0;
    },
};
export default permissionFunc;
//# sourceMappingURL=perm.js.map