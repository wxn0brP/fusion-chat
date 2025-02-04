import db from "../../dataBase.js";
import { hasPermission, combinePermissions, resetPermissions, canChangePermissions, hasAllPermissionsNumber, } from "./permission.js";
export default class PermissionSystem {
    realmRoles;
    realmUser;
    constructor(workspaceCollection) {
        if (!workspaceCollection)
            throw new Error("Missing required parameter workspaceCollection");
        this.realmRoles = db.realmRoles.c(workspaceCollection);
        this.realmUser = db.realmUser.c(workspaceCollection);
    }
    async initialize() {
        await this.validateHierarchy();
    }
    async validateHierarchy() {
        const roles = await this.getAllRolesSorted();
        if (roles.length === 0)
            return;
        const rootRoles = roles.filter(r => r.lvl === 0);
        if (rootRoles.length > 1)
            throw new Error("System cannot have multiple root roles (lvl 0)");
        for (let i = 1; i < roles.length; i++) {
            if (roles[i].lvl <= roles[i - 1].lvl) {
                throw new Error("Role lvl must form a strict ascending chain");
            }
        }
    }
    async createRole(name, opts = {}) {
        opts = {
            lvl: null,
            p: 0,
            c: "#fff",
            managerId: false,
            ...opts
        };
        let { lvl, p, c, managerId } = opts;
        if (Array.isArray(p))
            p = combinePermissions(0, ...p);
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
        }
        else {
            if (roles.some(r => r.lvl === lvl)) {
                throw new Error(`lvl ${lvl} is already occupied`);
            }
            const insertIndex = roles.findIndex(r => r.lvl > lvl);
            if (insertIndex !== -1) {
                if (insertIndex > 0 && lvl <= roles[insertIndex - 1].lvl)
                    throw new Error("Invalid lvl - would break chain with previous role");
                if (insertIndex < roles.length && lvl >= roles[insertIndex].lvl)
                    throw new Error("Invalid lvl - would break chain with next role");
            }
            else {
                lvl = roles.length > 0 ? roles[roles.length - 1].lvl + 1 : 0;
            }
        }
        return await this.realmRoles.add({
            name,
            lvl,
            p,
            c
        });
    }
    async updateRole(roleId, updates, managerId = null) {
        const role = await this.getRole(roleId);
        if (!role)
            throw new Error("Role not found");
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
    async deleteRole(roleId, managerId) {
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
    async assignRoleToUser(userId, roleId, managerId) {
        const role = await this.getRole(roleId);
        if (!role)
            throw new Error("Role not found");
        if (managerId !== false) {
            const managerRoles = await this.getUserRolesSorted(managerId);
            if (!this.hasHigherRole(managerRoles, role.lvl))
                throw new Error("Insufficient permissions to assign this role");
        }
        return await this.realmUser.updateOneOrAdd({ u: userId }, { $pushset: { r: roleId } }, {}, {}, false);
    }
    async removeRoleFromUser(userId, roleId, managerId) {
        const [role, managerRoles] = await Promise.all([
            this.getRole(roleId),
            this.getUserRolesSorted(managerId)
        ]);
        if (!role)
            throw new Error("Role not found");
        if (!this.hasHigherRole(managerRoles, role.lvl))
            throw new Error("Insufficient permissions to remove this role");
        return await this.realmUser.updateOne({ u: userId }, { $pull: { r: roleId } });
    }
    hasHigherRole(userRoles, targetLvl) {
        return userRoles && userRoles.some(role => role.lvl < targetLvl);
    }
    calculateCombinedPermissions(roles) {
        if (!roles || roles.length === 0)
            return resetPermissions();
        return roles.reduce((perms, role) => combinePermissions(perms, role.p), 0);
    }
    async getRole(roleId) {
        return await this.realmRoles.findOne({ _id: roleId });
    }
    async getAllRolesSorted() {
        const roles = await this.realmRoles.find({});
        return roles.sort((a, b) => a.lvl - b.lvl);
    }
    async getUserRolesSorted(userId) {
        const userData = await this.realmUser.findOne({
            $or: [
                { u: userId },
                { bot: userId }
            ]
        });
        if (!userData)
            return [];
        const userRoles = userData.r;
        if (userRoles.length === 0)
            return [];
        const rolesMap = new Map();
        const roles = await this.realmRoles.find({
            $or: userRoles.map(a => ({ _id: a }))
        });
        roles.forEach(role => rolesMap.set(role._id, role));
        return userRoles
            .map(role => rolesMap.get(role))
            .filter(Boolean)
            .sort((a, b) => a.lvl - b.lvl);
    }
    async getUserHighestRole(userId) {
        const roles = await this.getUserRolesSorted(userId);
        return roles.length > 0 ? roles[0] : null;
    }
    async canUserPerformAction(userId, requiredPermission) {
        const roles = await this.getUserRolesSorted(userId);
        const combinedPermissions = this.calculateCombinedPermissions(roles);
        return hasPermission(combinedPermissions, requiredPermission);
    }
    async canUserPerformAllActions(userId, requiredPermissions) {
        const roles = await this.getUserRolesSorted(userId);
        const combinedPermissions = this.calculateCombinedPermissions(roles);
        return requiredPermissions.every(permission => hasPermission(combinedPermissions, permission));
    }
    async canUserPerformAnyAction(userId, permissions) {
        const roles = await this.getUserRolesSorted(userId);
        const combinedPermissions = this.calculateCombinedPermissions(roles);
        return permissions.some(permission => hasPermission(combinedPermissions, permission));
    }
    async canManageUser(managerId, targetUserId) {
        const [managerHighestRole, targetHighestRole] = await Promise.all([
            this.getUserHighestRole(managerId),
            this.getUserHighestRole(targetUserId)
        ]);
        if (!managerHighestRole)
            return false;
        if (!targetHighestRole)
            return true;
        return managerHighestRole.lvl < targetHighestRole.lvl;
    }
    async getUserPermissions(userId) {
        const roles = await this.getUserRolesSorted(userId);
        return this.calculateCombinedPermissions(roles);
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9iYWNrL2xvZ2ljL3Blcm1pc3Npb24tc3lzdGVtL2luZGV4LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUNBLE9BQU8sRUFBRSxNQUFNLGdCQUFnQixDQUFDO0FBQ2hDLE9BQU8sRUFDSCxhQUFhLEVBQ2Isa0JBQWtCLEVBQ2xCLGdCQUFnQixFQUNoQixvQkFBb0IsRUFDcEIsdUJBQXVCLEdBQzFCLE1BQU0sY0FBYyxDQUFDO0FBV3RCLE1BQU0sQ0FBQyxPQUFPLE9BQU8sZ0JBQWdCO0lBQ2pDLFVBQVUsQ0FBb0I7SUFDOUIsU0FBUyxDQUFvQjtJQU03QixZQUFZLG1CQUEyQjtRQUNuQyxJQUFJLENBQUMsbUJBQW1CO1lBQ3BCLE1BQU0sSUFBSSxLQUFLLENBQUMsZ0RBQWdELENBQUMsQ0FBQztRQUV0RSxJQUFJLENBQUMsVUFBVSxHQUFHLEVBQUUsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLG1CQUFtQixDQUFDLENBQUM7UUFDdkQsSUFBSSxDQUFDLFNBQVMsR0FBRyxFQUFFLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxtQkFBbUIsQ0FBQyxDQUFDO0lBQ3pELENBQUM7SUFNRCxLQUFLLENBQUMsVUFBVTtRQUNaLE1BQU0sSUFBSSxDQUFDLGlCQUFpQixFQUFFLENBQUM7SUFDbkMsQ0FBQztJQU1ELEtBQUssQ0FBQyxpQkFBaUI7UUFDbkIsTUFBTSxLQUFLLEdBQUcsTUFBTSxJQUFJLENBQUMsaUJBQWlCLEVBQUUsQ0FBQztRQUM3QyxJQUFJLEtBQUssQ0FBQyxNQUFNLEtBQUssQ0FBQztZQUNsQixPQUFPO1FBRVgsTUFBTSxTQUFTLEdBQUcsS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxHQUFHLEtBQUssQ0FBQyxDQUFDLENBQUM7UUFDakQsSUFBSSxTQUFTLENBQUMsTUFBTSxHQUFHLENBQUM7WUFDcEIsTUFBTSxJQUFJ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