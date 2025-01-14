// Permission breakdown
// Defining permissions as bit flags
export enum Permissions {
    admin = 1 << 0,
    manageMessages = 1 << 1,
    banUser = 1 << 2,
    muteUser = 1 << 3,
    kickUser = 1 << 4,
    manageRoles = 1 << 5,
    manageEmojis = 1 << 6,
    manageInvites = 1 << 7,
    manageWebhooks = 1 << 8,
    manageChannels = 1 << 9,
}
export default Permissions;

/**
 * Checks if a user has a specific permission
 * @param userPermissions - Number representing the user's permissions
 * @param permission - Permission to check
 * @returns - true if the user has the permission
 */
export function hasPermission(userPermissions: number, permission: number): boolean {
    return (userPermissions & permission) !== 0;
}
/**
 * Adds a permission to the user's set of permissions
 * @param userPermissions - Current number representing the user's permissions
 * @param permission - Permission to be added
 * @returns Updated user's permissions
 */
export function addPermission(userPermissions: number, permission: number): number {
    return userPermissions | permission;
}

/**
 * Removes a permission from the user's set of permissions
 * @param userPermissions - Current number representing the user's permissions
 * @param permission - Permission to be removed
 * @returns Updated user's permissions
 */
export function removePermission(userPermissions: number, permission: number): number {
    return userPermissions & ~permission;
}

/**
 * Combines multiple permissions into one
 * @param permissions - List of permissions to combine
 * @returns Number representing the combined permissions
 */
export function combinePermissions(...permissions: number[]): number {
    return permissions.reduce((acc, permission) => acc | permission, 0);
}

/**
 * Removes all user's permissions (sets to 0)
 * @returns Reset permissions
 */
export function resetPermissions(): number {
    return 0;
}

/**
 * Checks if a user has all required permissions
 * @param userPermissions - Number representing the user's permissions
 * @param requiredPermissions - List of permissions that the user must have
 * @returns true if the user has all required permissions
 */
export function hasAllPermissions(userPermissions: number, requiredPermissions: number[]): boolean {
    if (requiredPermissions.length === 0) return true;
    return requiredPermissions.every(permission => (userPermissions & permission) !== 0);
}

/**
 * Checks if a user has all required permissions. This function is faster than
 * hasAllPermissions, but works only if requiredPermissions is a number.
 * @param userPermissions - Number representing the user's permissions
 * @param requiredPermissions - Number representing the required permissions
 * @returns true if the user has all required permissions
 */
export function hasAllPermissionsNumber(userPermissions: number, requiredPermissions: number): boolean {
    return (userPermissions & requiredPermissions) === requiredPermissions;
}

/**
 * Checks if a user has any of the required permissions
 * @param userPermissions - Number representing the user's permissions
 * @param requiredPermissions - List of permissions that the user must have
 * @returns true if the user has any of the required permissions
 */
export function hasAnyPermission(userPermissions: number, requiredPermissions: number[]): boolean {
    if (requiredPermissions.length === 0) return true;
    return requiredPermissions.some(permission => (userPermissions & permission) !== 0);
}

/**
 * Checks if a user has any of the required permissions. This function is faster than
 * hasAnyPermission, but works only if requiredPermissions is a number.
 * @param userPermissions - Number representing the user's permissions
 * @param requiredPermissions - Number representing the required permissions
 * @returns true if the user has any of the required permissions
 */
export function hasAnyPermissionNumber(userPermissions: number, requiredPermissions: number): boolean {
    return (userPermissions & requiredPermissions) !== 0;
}

/**
 * Generates a number of permissions based on a list of permissions
 * @param permissionsList - List of permissions to include
 * @returns Number representing the combined permissions
 */
export function generatePermissions(permissionsList: number[]): number {
    return permissionsList.reduce((acc, permission) => acc | permission, 0);
}

/**
 * Generates a number representing all permissions
 * @param permissions - Object of permissions
 * @returns Number representing all permissions
 */
export function getAllPermissions<T>(permissions: T): number {
    return Object.values(permissions).filter(perm => typeof perm === "number").reduce((acc, perm) => acc | perm, 0) as number;
}

/**
 * Checks if a manager can apply the requested permission changes
 * @param newPermissions - The new permissions value to be applied
 * @param currentPermissions - The current permissions value
 * @param managerPermissions - Permissions of the manager attempting the change
 * @returns true if the manager can make the requested changes
 */
export function canChangePermissions(newPermissions: number, currentPermissions: number, managerPermissions: number): boolean {
    const difference = newPermissions ^ currentPermissions;
    return (difference & ~managerPermissions) === 0;
}

