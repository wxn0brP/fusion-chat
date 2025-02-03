import CollectionManager from "@wxn0brp/db/dist/esm/CollectionManager";
import db from "../../dataBase";
import {
    hasPermission,
    combinePermissions,
    resetPermissions,
    canChangePermissions,
    hasAllPermissionsNumber,
} from "./permission";
import Logic_PermSys from "../../types/logic/perm-sys";
import Db_RealmRoles from "../../types/db/realmRoles";
import { Id } from "../../types/base";
import Db_RealmUser from "../../types/db/realmUser";

/**
 * A hierarchical role-based permission system for managing roles and permissions in a workspace.
 * Roles are organized in a strict ascending level chain, and permissions are managed using bitflags.
 * Managers with higher-level roles can assign roles and permissions to users with lower-level roles.
 */
export default class PermissionSystem {
    realmRoles: CollectionManager;
    realmUser: CollectionManager;

    /**
     * @param workspaceCollection - The workspace collection identifier.
     * @throws If `workspaceCollection` is missing or invalid.
     */
    constructor(workspaceCollection: string) {
        if (!workspaceCollection)
            throw new Error("Missing required parameter workspaceCollection");

        this.realmRoles = db.realmRoles.c(workspaceCollection);
        this.realmUser = db.realmUser.c(workspaceCollection);
    }

    /**
     * Initializes the permission system and validates the role hierarchy.
     * @throws If the role hierarchy is invalid (e.g., multiple root roles or broken chain).
     */
    async initialize() {
        await this.validateHierarchy();
    }

    /**
     * Validates the role hierarchy to ensure it forms a strict ascending chain.
     * @throws If the hierarchy is invalid.
     */
    async validateHierarchy() {
        const roles = await this.getAllRolesSorted();
        if (roles.length === 0)
            return; // System can operate without defined roles

        const rootRoles = roles.filter(r => r.lvl === 0);
        if (rootRoles.length > 1)
            throw new Error("System cannot have multiple root roles (lvl 0)");

        for (let i = 1; i < roles.length; i++) {
            if (roles[i].lvl <= roles[i - 1].lvl) {
                throw new Error("Role lvl must form a strict ascending chain");
            }
        }
    }

    /**
     * Creates a new role with the specified name and options.
     * @param name - The name of the role.
     * @param [opts={}] - Options for the role (e.g., level, permissions, color).
     * @returns The newly created role.
     * @throws If the level is invalid, permissions are invalid, or the manager lacks permissions.
     */
    async createRole(name: string, opts: Logic_PermSys.createRole__opts = {}) {
        opts = {
            lvl: null,
            p: 0,
            c: "#fff",
            managerId: false,
            ...opts
        };

        let { lvl, p, c, managerId } = opts;

        if (Array.isArray(p)) p = combinePermissions(0, ...p);

        if (typeof p !== "number")
            throw new Error("p must be a number or array of permissions bitflags");

        if (managerId) {
            const userHighestRole = await this.getUserHighestRole(managerId);
            if (userHighestRole.lvl >= lvl)
                throw new Error("Invalid lvl - would break chain with user's highest role");

            const userPerms = await this.getUserPermissions(managerId);
            if (!hasAllPermissionsNumber(userPerms, p))
                throw new Error("Cannot assign permissions you do not have");
        }

        const roles = await this.getAllRolesSorted();

        if (lvl === null) {
            lvl = roles.length > 0 ? roles[roles.length - 1].lvl + 1 : 0;
        } else {
            if (roles.some(r => r.lvl === lvl)) {
                throw new Error(`lvl ${lvl} is already occupied`);
            }

            const insertIndex = roles.findIndex(r => r.lvl > lvl);

            if (insertIndex !== -1) {
                if (insertIndex > 0 && lvl <= roles[insertIndex - 1].lvl)
                    throw new Error("Invalid lvl - would break chain with previous role");

                if (insertIndex < roles.length && lvl >= roles[insertIndex].lvl)
                    throw new Error("Invalid lvl - would break chain with next role");
            } else {
                lvl = roles.length > 0 ? roles[roles.length - 1].lvl + 1 : 0;
            }
        }

        return await this.realmRoles.add<Db_RealmRoles.role>({
            name,
            lvl,
            p,
            c
        });
    }

    /**
     * Updates an existing role with the specified updates.
     * @param roleId - The ID of the role to update.
     * @param updates - The updates to apply to the role.
     * @param [managerId=null] - The ID of the manager performing the update.
     * @throws If the role is not found, the manager lacks permissions, or the updates are invalid.
     */
    async updateRole(roleId: Id, updates: Partial<Db_RealmRoles.role>, managerId: Id = null) {
        const role = await this.getRole(roleId);
        if (!role) throw new Error("Role not found");

        if (managerId) {
            const managerRoles = await this.getUserRolesSorted(managerId);
            if (!this.hasHigherRole(managerRoles, role.lvl))
                throw new Error("Insufficient permissions to edit this role");

            if (updates.p !== undefined) {
                const managerPerms = this.calculateCombinedPermissions(managerRoles);

                if (!canChangePermissions(updates.p, role.p, managerPerms))
                    throw new Error("Cannot assign permissions you do not have");
            }
        }

        return await this.realmRoles.updateOne({ _id: roleId }, updates);
    }

    /**
     * Deletes a role and adjusts the levels of remaining roles to maintain the hierarchy.
     * @param roleId - The ID of the role to delete.
     * @param managerId - The ID of the manager performing the deletion, or `false` to bypass permission checks.
     * @throws If the role is not found or the manager lacks permissions.
     */
    async deleteRole(roleId: Id, managerId: Id | false) {
        let roles = await this.getAllRolesSorted();

        if (managerId) {
            const managerHighestRole = await this.getUserHighestRole(managerId);
            if (managerHighestRole.lvl >= roles.find(r => r._id === roleId).lvl) {
                throw new Error("Insufficient permissions to delete this role");
            }
        }

        roles = roles.filter(r => r._id !== roleId);
        const _this = this;

        roles.forEach((role, i) => {
            role.lvl = i;
            _this.realmRoles.updateOne({ _id: role._id }, { lvl: i });
        });

        await this.realmRoles.removeOne({ _id: roleId });
        await this.realmUser.update({ $arrinc: { r: [roleId] } }, { $pull: { r: roleId } });
    }

    /**
     * Assigns a role to a user.
     * @param userId - The ID of the user to assign the role to.
     * @param roleId - The ID of the role to assign.
     * @param managerId - The ID of the manager performing the assignment, or `false` to bypass permission checks.
     * @throws If the role is not found or the manager lacks permissions.
     */
    async assignRoleToUser(userId: Id, roleId: Id, managerId: Id | false) {
        const role = await this.getRole(roleId);

        if (!role) throw new Error("Role not found");

        if (managerId !== false) {
            const managerRoles = await this.getUserRolesSorted(managerId);
            if (!this.hasHigherRole(managerRoles, role.lvl))
                throw new Error("Insufficient permissions to assign this role");
        }

        return await this.realmUser.updateOneOrAdd(
            { u: userId },
            { $pushset: { r: roleId } },
            {},
            {},
            false
        );
    }

    /**
     * Removes a role from a user.
     * @param userId - The ID of the user to remove the role from.
     * @param roleId - The ID of the role to remove.
     * @param managerId - The ID of the manager performing the removal.
     * @throws If the role is not found or the manager lacks permissions.
     */
    async removeRoleFromUser(userId: Id, roleId: Id, managerId: Id) {
        const [role, managerRoles] = await Promise.all([
            this.getRole(roleId),
            this.getUserRolesSorted(managerId)
        ]);

        if (!role) throw new Error("Role not found");

        if (!this.hasHigherRole(managerRoles, role.lvl))
            throw new Error("Insufficient permissions to remove this role");

        return await this.realmUser.updateOne({ u: userId }, { $pull: { r: roleId } });
    }

    /**
     * Checks if a user has a higher-level role than the target level.
     * @param userRoles - The roles of the user.
     * @param targetLvl - The target level to compare against.
     * @returns True if the user has a higher-level role, otherwise false.
     */
    hasHigherRole(userRoles: Db_RealmRoles.role[], targetLvl: number) {
        return userRoles && userRoles.some(role => role.lvl < targetLvl);
    }

    /**
     * Calculates the combined permissions for a set of roles.
     * @param roles - The roles to calculate permissions for.
     * @returns The combined permissions as a bit flag.
     */
    calculateCombinedPermissions(roles: Db_RealmRoles.role[]) {
        if (!roles || roles.length === 0) return resetPermissions();
        return roles.reduce((perms, role) => combinePermissions(perms, role.p), 0);
    }

    /**
     * Retrieves a role by its ID.
     * @param roleId - The ID of the role to retrieve.
     * @returns {Promise<Db_RealmRoles.role | null>} The role, or null if not found.
     */
    async getRole(roleId: Id) {
        return await this.realmRoles.findOne({ _id: roleId });
    }

    /**
     * Retrieves all roles sorted by level in ascending order.
     * @returns {Promise<Db_RealmRoles.role[]>} The sorted list of roles.
     */
    async getAllRolesSorted() {
        const roles = await this.realmRoles.find<Db_RealmRoles.role>({});
        return roles.sort((a, b) => a.lvl - b.lvl);
    }

    /**
     * Retrieves the roles assigned to a user, sorted by level in ascending order.
     * @param userId - The ID of the user.
     * @returns {Promise<Db_RealmRoles.role[]>} The sorted list of roles assigned to the user.
     */
    async getUserRolesSorted(userId: Id) {
        const userData = await this.realmUser.findOne<Db_RealmUser.user | Db_RealmUser.bot>({
            $or: [
                { u: userId },
                { bot: userId }
            ]
        });
        if (!userData) return [];

        const userRoles = userData.r;
        if (userRoles.length === 0) return [];

        const rolesMap = new Map<Id, Db_RealmRoles.role>();
        const roles = await this.realmRoles.find<Db_RealmRoles.role>({
            $or: userRoles.map(a => ({ _id: a }))
        });

        roles.forEach(role => rolesMap.set(role._id, role));

        return userRoles
            .map(role => rolesMap.get(role))
            .filter(Boolean)
            .sort((a, b) => a.lvl - b.lvl);
    }

    /**
     * Retrieves the highest-level role assigned to a user.
     * @param userId - The ID of the user.
     * @returns {Promise<Db_RealmRoles.role | null>} The highest-level role, or null if no roles are assigned.
     */
    async getUserHighestRole(userId: Id) {
        const roles = await this.getUserRolesSorted(userId);
        return roles.length > 0 ? roles[0] : null;
    }

    /**
     * Checks if a user has a specific permission.
     * @param userId - The ID of the user.
     * @param requiredPermission - The permission to check.
     * @returns {Promise<boolean>} True if the user has the permission, otherwise false.
     */
    async canUserPerformAction(userId: Id, requiredPermission: number) {
        const roles = await this.getUserRolesSorted(userId);
        const combinedPermissions = this.calculateCombinedPermissions(roles);
        return hasPermission(combinedPermissions, requiredPermission);
    }

    /**
     * Checks if a user has all the specified permissions.
     * @param userId - The ID of the user.
     * @param requiredPermissions - The permissions to check.
     * @returns True if the user has all permissions, otherwise false.
     */
    async canUserPerformAllActions(userId: Id, requiredPermissions: number[]) {
        const roles = await this.getUserRolesSorted(userId);
        const combinedPermissions = this.calculateCombinedPermissions(roles);

        return requiredPermissions.every(permission =>
            hasPermission(combinedPermissions, permission)
        );
    }

    /**
     * Checks if a user has any of the specified permissions.
     * @param userId - The ID of the user.
     * @param permissions - The permissions to check.
     * @returns True if the user has any of the permissions, otherwise false.
     */
    async canUserPerformAnyAction(userId: Id, permissions: number[]) {
        const roles = await this.getUserRolesSorted(userId);
        const combinedPermissions = this.calculateCombinedPermissions(roles);

        return permissions.some(permission =>
            hasPermission(combinedPermissions, permission)
        );
    }

    /**
     * Checks if a manager can manage a target user based on role hierarchy.
     * @param managerId - The ID of the manager.
     * @param targetUserId - The ID of the target user.
     * @returns True if the manager can manage the user, otherwise false.
     */
    async canManageUser(managerId: Id, targetUserId: Id) {
        const [managerHighestRole, targetHighestRole] = await Promise.all([
            this.getUserHighestRole(managerId),
            this.getUserHighestRole(targetUserId)
        ]);

        if (!managerHighestRole) return false;
        if (!targetHighestRole) return true; // User without roles can be managed
        return managerHighestRole.lvl < targetHighestRole.lvl;
    }

    /**
     * Retrieves the combined permissions for a user based on their assigned roles.
     * @param userId - The ID of the user.
     * @returns The combined permissions as a bit flag.
     */
    async getUserPermissions(userId: Id) {
        const roles = await this.getUserRolesSorted(userId);
        return this.calculateCombinedPermissions(roles);
    }
}
