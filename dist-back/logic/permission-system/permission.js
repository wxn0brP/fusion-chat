export var Permissions;
(function (Permissions) {
    Permissions[Permissions["admin"] = 1] = "admin";
    Permissions[Permissions["manageMessages"] = 2] = "manageMessages";
    Permissions[Permissions["banUser"] = 4] = "banUser";
    Permissions[Permissions["muteUser"] = 8] = "muteUser";
    Permissions[Permissions["kickUser"] = 16] = "kickUser";
    Permissions[Permissions["manageRoles"] = 32] = "manageRoles";
    Permissions[Permissions["manageEmojis"] = 64] = "manageEmojis";
    Permissions[Permissions["manageInvites"] = 128] = "manageInvites";
    Permissions[Permissions["manageWebhooks"] = 256] = "manageWebhooks";
    Permissions[Permissions["manageChannels"] = 512] = "manageChannels";
})(Permissions || (Permissions = {}));
export default Permissions;
export function hasPermission(userPermissions, permission) {
    return (userPermissions & permission) !== 0;
}
export function addPermission(userPermissions, permission) {
    return userPermissions | permission;
}
export function removePermission(userPermissions, permission) {
    return userPermissions & ~permission;
}
export function combinePermissions(...permissions) {
    return permissions.reduce((acc, permission) => acc | permission, 0);
}
export function resetPermissions() {
    return 0;
}
export function hasAllPermissions(userPermissions, requiredPermissions) {
    if (requiredPermissions.length === 0)
        return true;
    return requiredPermissions.every(permission => (userPermissions & permission) !== 0);
}
export function hasAllPermissionsNumber(userPermissions, requiredPermissions) {
    return (userPermissions & requiredPermissions) === requiredPermissions;
}
export function hasAnyPermission(userPermissions, requiredPermissions) {
    if (requiredPermissions.length === 0)
        return true;
    return requiredPermissions.some(permission => (userPermissions & permission) !== 0);
}
export function hasAnyPermissionNumber(userPermissions, requiredPermissions) {
    return (userPermissions & requiredPermissions) !== 0;
}
export function generatePermissions(permissionsList) {
    return permissionsList.reduce((acc, permission) => acc | permission, 0);
}
export function getAllPermissions(permissions) {
    return Object.values(permissions).filter(perm => typeof perm === "number").reduce((acc, perm) => acc | perm, 0);
}
export function canChangePermissions(newPermissions, currentPermissions, managerPermissions) {
    const difference = newPermissions ^ currentPermissions;
    return (difference & ~managerPermissions) === 0;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGVybWlzc2lvbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL2JhY2svbG9naWMvcGVybWlzc2lvbi1zeXN0ZW0vcGVybWlzc2lvbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFFQSxNQUFNLENBQU4sSUFBWSxXQVdYO0FBWEQsV0FBWSxXQUFXO0lBQ25CLCtDQUFjLENBQUE7SUFDZCxpRUFBdUIsQ0FBQTtJQUN2QixtREFBZ0IsQ0FBQTtJQUNoQixxREFBaUIsQ0FBQTtJQUNqQixzREFBaUIsQ0FBQTtJQUNqQiw0REFBb0IsQ0FBQTtJQUNwQiw4REFBcUIsQ0FBQTtJQUNyQixpRUFBc0IsQ0FBQTtJQUN0QixtRUFBdUIsQ0FBQTtJQUN2QixtRUFBdUIsQ0FBQTtBQUMzQixDQUFDLEVBWFcsV0FBVyxLQUFYLFdBQVcsUUFXdEI7QUFDRCxlQUFlLFdBQVcsQ0FBQztBQVEzQixNQUFNLFVBQVUsYUFBYSxDQUFDLGVBQXVCLEVBQUUsVUFBa0I7SUFDckUsT0FBTyxDQUFDLGVBQWUsR0FBRyxVQUFVLENBQUMsS0FBSyxDQUFDLENBQUM7QUFDaEQsQ0FBQztBQVFELE1BQU0sVUFBVSxhQUFhLENBQUMsZUFBdUIsRUFBRSxVQUFrQjtJQUNyRSxPQUFPLGVBQWUsR0FBRyxVQUFVLENBQUM7QUFDeEMsQ0FBQztBQVFELE1BQU0sVUFBVSxnQkFBZ0IsQ0FBQyxlQUF1QixFQUFFLFVBQWtCO0lBQ3hFLE9BQU8sZUFBZSxHQUFHLENBQUMsVUFBVSxDQUFDO0FBQ3pDLENBQUM7QUFPRCxNQUFNLFVBQVUsa0JBQWtCLENBQUMsR0FBRyxXQUFxQjtJQUN2RCxPQUFPLFdBQVcsQ0FBQyxNQUFNLENBQUMsQ0FBQyxHQUFHLEVBQUUsVUFBVSxFQUFFLEVBQUUsQ0FBQyxHQUFHLEdBQUcsVUFBVSxFQUFFLENBQUMsQ0FBQyxDQUFDO0FBQ3hFLENBQUM7QUFNRCxNQUFNLFVBQVUsZ0JBQWdCO0lBQzVCLE9BQU8sQ0FBQyxDQUFDO0FBQ2IsQ0FBQztBQVFELE1BQU0sVUFBVSxpQkFBaUIsQ0FBQyxlQUF1QixFQUFFLG1CQUE2QjtJQUNwRixJQUFJLG1CQUFtQixDQUFDLE1BQU0sS0FBSyxDQUFDO1FBQUUsT0FBTyxJQUFJLENBQUM7SUFDbEQsT0FBTyxtQkFBbUIsQ0FBQyxLQUFLLENBQUMsVUFBVSxDQUFDLEVBQUUsQ0FBQyxDQUFDLGVBQWUsR0FBRyxVQUFVLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztBQUN6RixDQUFDO0FBU0QsTUFBTSxVQUFVLHVCQUF1QixDQUFDLGVBQXVCLEVBQUUsbUJBQTJCO0lBQ3hGLE9BQU8sQ0FBQyxlQUFlLEdBQUcsbUJBQW1CLENBQUMsS0FBSyxtQkFBbUIsQ0FBQztBQUMzRSxDQUFDO0FBUUQsTUFBTSxVQUFVLGdCQUFnQixDQUFDLGVBQXVCLEVBQUUsbUJBQTZCO0lBQ25GLElBQUksbUJBQW1CLENBQUMsTUFBTSxLQUFLLENBQUM7UUFBRSxPQUFPLElBQUksQ0FBQztJQUNsRCxPQUFPLG1CQUFtQixDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsRUFBRSxDQUFDLENBQUMsZUFBZSxHQUFHLFVBQVUsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO0FBQ3hGLENBQUM7QUFTRCxNQUFNLFVBQVUsc0JBQXNCLENBQUMsZUFBdUIsRUFBRSxtQkFBMkI7SUFDdkYsT0FBTyxDQUFDLGVBQWUsR0FBRyxtQkFBbUIsQ0FBQyxLQUFLLENBQUMsQ0FBQztBQUN6RCxDQUFDO0FBT0QsTUFBTSxVQUFVLG1CQUFtQixDQUFDLGVBQXlCO0lBQ3pELE9BQU8sZUFBZSxDQUFDLE1BQU0sQ0FBQyxDQUFDLEdBQUcsRUFBRSxVQUFVLEVBQUUsRUFBRSxDQUFDLEdBQUcsR0FBRyxVQUFVLEVBQUUsQ0FBQyxDQUFDLENBQUM7QUFDNUUsQ0FBQztBQU9ELE1BQU0sVUFBVSxpQkFBaUIsQ0FBSSxXQUFjO0lBQy9DLE9BQU8sTUFBTSxDQUFDLE1BQU0sQ0FBQyxXQUFXLENBQUMsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxPQUFPLElBQUksS0FBSyxRQUFRLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxHQUFHLEVBQUUsSUFBSSxFQUFFLEVBQUUsQ0FBQyxHQUFHLEdBQUcsSUFBSSxFQUFFLENBQUMsQ0FBVyxDQUFDO0FBQzlILENBQUM7QUFTRCxNQUFNLFVBQVUsb0JBQW9CLENBQUMsY0FBc0IsRUFBRSxrQkFBMEIsRUFBRSxrQkFBMEI7SUFDL0csTUFBTSxVQUFVLEdBQUcsY0FBYyxHQUFHLGtCQUFrQixDQUFDO0lBQ3ZELE9BQU8sQ0FBQyxVQUFVLEdBQUcsQ0FBQyxrQkFBa0IsQ0FBQyxLQUFLLENBQUMsQ0FBQztBQUNwRCxDQUFDIn0=