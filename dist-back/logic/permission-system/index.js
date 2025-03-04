import db from "../../dataBase.js";
import { hasPermission, combinePermissions, resetPermissions, canChangePermissions, hasAllPermissionsNumber, } from "./permission.js";
export default class PermissionSystem {
    realmRoles;
    realmUser;
    realmId;
    constructor(workspaceCollection) {
        if (!workspaceCollection)
            throw new Error("Missing required parameter workspaceCollection");
        this.realmId = workspaceCollection;
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
            if (userHighestRole.lvl >= lvl && !this.isUserBeKing(managerId, userHighestRole.lvl))
                throw new Error("Invalid lvl - would break chain with user's highest role");
            const userPerms = await this.getUserPermissions(managerId);
            if (!hasAllPermissionsNumber(userPerms, p) && !this.isUserBeKing(managerId, userHighestRole.lvl))
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
            if (!this.hasHigherRole(managerRoles, role.lvl) && !this.isUserBeKing(managerId))
                throw new Error("Insufficient permissions to edit this role");
            if (updates.p !== undefined) {
                const managerPerms = this.calculateCombinedPermissions(managerRoles);
                if (!canChangePermissions(updates.p, role.p, managerPerms) && !this.isUserBeKing(managerId))
                    throw new Error("Cannot assign permissions you do not have");
            }
        }
        return await this.realmRoles.updateOne({ _id: roleId }, updates);
    }
    async deleteRole(roleId, managerId) {
        let roles = await this.getAllRolesSorted();
        if (managerId) {
            const managerHighestRole = await this.getUserHighestRole(managerId);
            if (managerHighestRole.lvl >= roles.find(r => r._id === roleId).lvl &&
                !this.isUserBeKing(managerId, managerHighestRole.lvl)) {
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
    async isUserBeKing(userId, userHighestRoleLvl) {
        userHighestRoleLvl = userHighestRoleLvl || (await this.getUserHighestRole(userId))?.lvl;
        if (userHighestRoleLvl === 0)
            return true;
        const realmOwner = await db.realmConf.findOne(this.realmId, { _id: "set" }, {}, { select: ["owner"] });
        if (realmOwner && realmOwner.owner === userId)
            return true;
        return false;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9iYWNrL2xvZ2ljL3Blcm1pc3Npb24tc3lzdGVtL2luZGV4LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUNBLE9BQU8sRUFBRSxNQUFNLEtBQUssQ0FBQztBQUNyQixPQUFPLEVBQ0gsYUFBYSxFQUNiLGtCQUFrQixFQUNsQixnQkFBZ0IsRUFDaEIsb0JBQW9CLEVBQ3BCLHVCQUF1QixHQUMxQixNQUFNLGNBQWMsQ0FBQztBQVl0QixNQUFNLENBQUMsT0FBTyxPQUFPLGdCQUFnQjtJQUNqQyxVQUFVLENBQW9CO0lBQzlCLFNBQVMsQ0FBb0I7SUFDN0IsT0FBTyxDQUFTO0lBTWhCLFlBQVksbUJBQTJCO1FBQ25DLElBQUksQ0FBQyxtQkFBbUI7WUFDcEIsTUFBTSxJQUFJLEtBQUssQ0FBQyxnREFBZ0QsQ0FBQyxDQUFDO1FBRXRFLElBQUksQ0FBQyxPQUFPLEdBQUcsbUJBQW1CLENBQUM7UUFDbkMsSUFBSSxDQUFDLFVBQVUsR0FBRyxFQUFFLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxtQkFBbUIsQ0FBQyxDQUFDO1FBQ3ZELElBQUksQ0FBQyxTQUFTLEdBQUcsRUFBRSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsbUJBQW1CLENBQUMsQ0FBQztJQUN6RCxDQUFDO0lBTUQsS0FBSyxDQUFDLFVBQVU7UUFDWixNQUFNLElBQUksQ0FBQyxpQkFBaUIsRUFBRSxDQUFDO0lBQ25DLENBQUM7SUFNRCxLQUFLLENBQUMsaUJBQWlCO1FBQ25CLE1BQU0sS0FBSyxHQUFHLE1BQU0sSUFBSSxDQUFDLGlCQUFpQixFQUFFLENBQUM7UUFDN0MsSUFBSSxLQUFLLENBQUMsTUFBTSxLQUFLLENBQUM7WUFDbEIsT0FBTztRQUVYLE1BQU0sU0FBUyxHQUFHLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsR0FBRyxLQUFLLENBQUMsQ0FBQyxDQUFD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