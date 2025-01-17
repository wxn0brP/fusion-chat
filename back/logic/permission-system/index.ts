import CollectionManager from "@wxn0brp/db/dist/esm/CollectionManager.js";
import db from "../../dataBase.js";
import {
    hasPermission,
    combinePermissions,
    resetPermissions,
    canChangePermissions,
    hasAllPermissionsNumber,
} from "./permBD.js";
import Logic_PermSys from "../../types/logic/perm-sys.js";
import Db_RealmRoles from "../../types/db/realmRoles.js";
import { Id } from "../../types/base.js";

export default class PermissionSystem{
    realmRoles: CollectionManager;
    realmUser: CollectionManager;

    constructor(workspaceCollection: string){
        if(!workspaceCollection)
            throw new Error("Missing required parameter workspaceCollection");

        this.realmRoles = db.realmRoles.c(workspaceCollection);
        this.realmUser = db.realmUser.c(workspaceCollection);
    }

    async initialize(){
        await this.validateHierarchy();
    }

    async validateHierarchy(){
        const roles = await this.getAllRolesSorted();
        if(roles.length === 0)
            return; // System can operate without defined roles

        const rootRoles = roles.filter(r => r.lvl === 0);
        if(rootRoles.length > 1)
            throw new Error("System cannot have multiple root roles (lvl 0)");

        for(let i=1; i<roles.length; i++){
            if(roles[i].lvl <= roles[i - 1].lvl){
                throw new Error("Role lvl must form a strict ascending chain");
            }
        }
    }

    async createRole(name: string, opts: Logic_PermSys.createRole__opts={}){
        opts = {
            lvl: null,
            p: 0,
            c: "#fff",
            managerId: false,
            ...opts
        };

        let { lvl, p, c, managerId } = opts;
        
        if(Array.isArray(p)) p = combinePermissions(0, ...p);

        if(typeof p !== "number")
            throw new Error("p must be a number or array of permissions bitflags");

        if(managerId){
            const userHighestRole = await this.getUserHighestRole(managerId);
            if(userHighestRole.lvl >= lvl)
                throw new Error("Invalid lvl - would break chain with user's highest role");
            
            const userPerms = await this.getUserPermissions(managerId);
            if(!hasAllPermissionsNumber(userPerms, p))
                throw new Error("Cannot assign permissions you do not have");
        }

        const roles = await this.getAllRolesSorted();

        if(lvl === null){
            lvl = roles.length > 0 ? roles[roles.length - 1].lvl + 1 : 0;
        }else{
            if(roles.some(r => r.lvl === lvl)){
                throw new Error(`lvl ${lvl} is already occupied`);
            }

            const insertIndex = roles.findIndex(r => r.lvl > lvl);

            if(insertIndex !== -1){
                if(insertIndex > 0 && lvl <= roles[insertIndex - 1].lvl)
                    throw new Error("Invalid lvl - would break chain with previous role");

                if(insertIndex < roles.length && lvl >= roles[insertIndex].lvl)
                    throw new Error("Invalid lvl - would break chain with next role");
            }else{
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

    async updateRole(roleId: Id, updates: Partial<Db_RealmRoles.role>, managerId: Id=null){
        const role = await this.getRole(roleId);
        if(!role) throw new Error("Role not found");

        if(managerId){
            const managerRoles = await this.getUserRolesSorted(managerId);
            if(!this.hasHigherRole(managerRoles, role.lvl))
                throw new Error("Insufficient permissions to edit this role");
    
            if(updates.p !== undefined){
                const managerPerms = this.calculateCombinedPermissions(managerRoles);

                if(!canChangePermissions(updates.p, role.p, managerPerms))
                    throw new Error("Cannot assign permissions you do not have");
            }
        }

        return await this.realmRoles.updateOne({ _id: roleId }, updates);
    }

    async deleteRole(roleId: Id, managerId: Id | false){
        let roles = await this.getAllRolesSorted();

        if(managerId){
            const managerHighestRole = await this.getUserHighestRole(managerId);
            if(managerHighestRole.lvl >= roles.find(r => r._id === roleId).lvl){
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
        await this.realmUser.update({ $arrinc: { r: [roleId] }}, { $pull: { r: roleId } });
    }

    async assignRoleToUser(userId: Id, roleId: Id, managerId: Id | false){
        const role = await this.getRole(roleId);

        if(!role) throw new Error("Role not found");

        if(managerId !== false){
            const managerRoles = await this.getUserRolesSorted(managerId);
            if(!this.hasHigherRole(managerRoles, role.lvl))
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

    async removeRoleFromUser(userId: Id, roleId: Id, managerId: Id){
        const [role, managerRoles] = await Promise.all([
            this.getRole(roleId),
            this.getUserRolesSorted(managerId)
        ]);

        if(!role) throw new Error("Role not found");

        if(!this.hasHigherRole(managerRoles, role.lvl))
            throw new Error("Insufficient permissions to remove this role");

        return await this.realmUser.updateOne({ u: userId }, { $pull: { r: roleId } });
    }

    hasHigherRole(userRoles: Db_RealmRoles.role[], targetLvl: number){
        return userRoles && userRoles.some(role => role.lvl < targetLvl);
    }

    calculateCombinedPermissions(roles: Db_RealmRoles.role[]){
        if(!roles || roles.length === 0) return resetPermissions();
        return roles.reduce((perms, role) => combinePermissions(perms, role.p), 0);
    }

    async getRole(roleId: Id){
        return await this.realmRoles.findOne({ _id: roleId });
    }

    async getAllRolesSorted(){
        const roles = await this.realmRoles.find({});
        return roles.sort((a, b) => a.lvl - b.lvl);
    }

    async getUserRolesSorted(userId: Id){
        const userData = await this.realmUser.findOne({ u: userId });
        if(!userData) return [];

        const userRoles = userData.r;
        if(userRoles.length === 0) return [];

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

    async getUserHighestRole(userId: Id){
        const roles = await this.getUserRolesSorted(userId);
        return roles.length > 0 ? roles[0] : null;
    }

    async canUserPerformAction(userId: Id, requiredPermission: number){
        const roles = await this.getUserRolesSorted(userId);
        const combinedPermissions = this.calculateCombinedPermissions(roles);
        return hasPermission(combinedPermissions, requiredPermission);
    }

    async canUserPerformAllActions(userId: Id, requiredPermissions: number[]){
        const roles = await this.getUserRolesSorted(userId);
        const combinedPermissions = this.calculateCombinedPermissions(roles);
    
        return requiredPermissions.every(permission => 
            hasPermission(combinedPermissions, permission)
        );
    }

    async canUserPerformAnyAction(userId: Id, permissions: number[]){
        const roles = await this.getUserRolesSorted(userId);
        const combinedPermissions = this.calculateCombinedPermissions(roles);
    
        return permissions.some(permission => 
            hasPermission(combinedPermissions, permission)
        );
    }    

    async canManageUser(managerId: Id, targetUserId: Id){
        const [managerHighestRole, targetHighestRole] = await Promise.all([
            this.getUserHighestRole(managerId),
            this.getUserHighestRole(targetUserId)
        ]);

        if(!managerHighestRole) return false;
        if(!targetHighestRole) return true; // User without roles can be managed
        return managerHighestRole.lvl < targetHighestRole.lvl;
    }

    async getUserPermissions(userId: Id){
        const roles = await this.getUserRolesSorted(userId);
        return this.calculateCombinedPermissions(roles);
    }
}
