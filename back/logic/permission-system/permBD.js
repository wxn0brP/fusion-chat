// Permission breakdown
// Defining permissions as bit flags
export const Permissions = Object.freeze({
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
export default Permissions;

/**
 * Checks if a user has a specific permission
 * @param {number} userPermissions - Number representing the user's permissions
 * @param {number} permission - Permission to check
 * @returns {boolean} - true if the user has the permission
 */
export function hasPermission(userPermissions, permission){
    return (userPermissions & permission) !== 0;
}

/**
 * Adds a permission to the user's set of permissions
 * @param {number} userPermissions - Current number representing the user's permissions
 * @param {number} permission - Permission to be added
 * @returns {number} - Updated user's permissions
 */
export function addPermission(userPermissions, permission){
    return userPermissions | permission;
}

/**
 * Removes a permission from the user's set of permissions
 * @param {number} userPermissions - Current number representing the user's permissions
 * @param {number} permission - Permission to be removed
 * @returns {number} - Updated user's permissions
 */
export function removePermission(userPermissions, permission){
    return userPermissions & ~permission;
}

/**
 * Combines multiple permissions into one
 * @param {...number} permissions - List of permissions to combine
 * @returns {number} - Number representing the combined permissions
 */
export function combinePermissions(...permissions){
    return permissions.reduce((acc, permission) => acc | permission, 0);
}

/**
 * Removes all user's permissions (sets to 0)
 * @returns {number} - Reset permissions
 */
export function resetPermissions(){
    return 0;
}

/**
 * Checks if a user has all required permissions
 * @param {number} userPermissions - Number representing the user's permissions
 * @param {Array<number>} requiredPermissions - List of permissions that the user must have
 * @returns {boolean} - true if the user has all required permissions
 */
export function hasAllPermissions(userPermissions, requiredPermissions){
    if(requiredPermissions.length == 0) return true;
    return requiredPermissions.every(permission => (userPermissions & permission) !== 0);
}

/**
 * Checks if a user has all required permissions. This function is faster than
 * hasAllPermissions, but works only if requiredPermissions is a number.
 * @param {number} userPermissions - Number representing the user's permissions
 * @param {number} requiredPermissions - Number representing the required permissions
 * @returns {boolean} - true if the user has all required permissions
 */
export function hasAllPermissionsNumber(userPermissions, requiredPermissions){
    return (userPermissions & requiredPermissions) === requiredPermissions;
}

/**
 * Checks if a user has any of the required permissions
 * @param {number} userPermissions - Number representing the user's permissions
 * @param {Array<number>} requiredPermissions - List of permissions that the user must have
 * @returns {boolean} - true if the user has any of the required permissions
 */
export function hasAnyPermission(userPermissions, requiredPermissions){
    if(requiredPermissions.length == 0) return true;
    return requiredPermissions.some(permission => (userPermissions & permission) !== 0);
}

/**
 * Checks if a user has any of the required permissions. This function is faster than
 * hasAnyPermission, but works only if requiredPermissions is a number.
 * @param {number} userPermissions - Number representing the user's permissions
 * @param {number} requiredPermissions - Number representing the required permissions
 * @returns {boolean} - true if the user has any of the required permissions
 */
export function hasAnyPermissionNumber(userPermissions, requiredPermissions){
    return (userPermissions & requiredPermissions) !== 0;
}

/**
 * Generates a number of permissions based on a list of permissions
 * @param {Array<number>} permissionsList - List of permissions to include
 * @returns {number} - Number representing the combined permissions
 */
export function generatePermissions(permissionsList){
    return permissionsList.reduce((acc, permission) => acc | permission, 0);
}

/**
 * Generates a number representing all permissions
 * @param {Object} permissions - Object of permissions
 * @returns {number} - Number representing all permissions
 */
export function getAllPermissions(permissions){
    return Object.values(permissions).reduce((acc, perm) => acc | perm, 0);
}

/**
 * Checks if a manager can apply the requested permission changes
 * @param {number} newPermissions - The new permissions value to be applied
 * @param {number} currentPermissions - The current permissions value
 * @param {number} managerPermissions - Permissions of the manager attempting the change
 * @returns {boolean} - true if the manager can make the requested changes
 */
export function canChangePermissions(newPermissions, currentPermissions, managerPermissions){
    const difference = newPermissions ^ currentPermissions;
    return (difference & ~managerPermissions) === 0;
}
