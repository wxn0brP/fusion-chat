import genId from "../../db/gen.js";
import sortRolesByHierarchy from "./sortRolesByHierarchy.js";
import sortUserRolesByHierarchy from "./sortUserRolesByHierarchy.js";

/**
 * Represents a permission system for managing roles and permissions.
 * @class
 */
class permissionSystem{
    /**
     * Create a new permission system instance.
     * @constructor
     * @param {string} id - The unique identifier for the permission system.
     */
    constructor(id){
        this.id = id;
        this.dbUP = global.db.usersPerms;
        this.dbS = global.db.groupSettings;
    }
    /**
     * Get roles from the database and sort them by hierarchy.
     * @returns {Promise} A Promise that resolves with an array of sorted role objects or an empty array if not found.
     */
    async getRoles(){
        let roles = await this.dbS.find(this.id, (r) => !!r.rid);
        if(roles.length == 0) throw new Error("db obj is not exsists");

        roles = sortRolesByHierarchy(roles);
        return roles;
    }

    /**
     * Get roles associated with a user.
     * @param {string} user - The user identifier.
     * @returns {Promise} A Promise that resolves with an array of user roles or an empty array if not found.
     */
    async getUserRoles(user){
        const roles = await this.getRoles();
        const uroles = await this.dbUP.findOne(this.id, { uid: user });
        if(!uroles) return [];

        return sortUserRolesByHierarchy(roles, uroles.roles);
    }

    async printRoles(){
        let roles = await this.getRoles();
        roles = sortRolesByHierarchy(roles);
        console.table(roles);
    }

    async createRole(name, perm=[], parent=null){
        const rid = genId();
        if(!parent){
            const roles = await this.getRoles();
            parent = roles[roles.length - 1].rid;
        }
        const role = {
            rid,
            name,
            p: perm,
            parent,
        };
        this.dbS.add(this.id, role, false);
    }

    /* permission */

    /**
     * Check if a set of roles has a specific permission.
     * @param {Array} roles - An array of role identifiers.
     * @param {string} perm - The permission to check for.
     * @returns {Promise} A Promise that resolves to true if any role has the permission, or false if none do.
     */
    async hasPermison(roles, perm){
        const rolesDb = await this.getRoles();
        for(let i=0; i<roles.length; i++){
            let role = rolesDb.find(r => r.rid == roles[i]);
            if(!role) continue;
            if(role.p == "all") return true;
            if(role.p.includes(perm)) return true;
        }
        return false;
    }

    /**
     * Check if a user has a specific permission.
     * @param {string} user - The user identifier.
     * @param {string} perm - The permission to check for.
     * @returns {Promise} A Promise that resolves to true if the user has the permission, or false if not.
     */
    async userPermison(user, perm){
        user = await this.dbUP.findOne(this.id, { uid: user });
        if(!user) return false;
        return await this.hasPermison(user.roles, perm);
    }

    /* role menager */

    /**
     * Check if one role is higher in hierarchy than another.
     * @param {string} role1 - The first role identifier.
     * @param {string} role2 - The second role identifier.
     * @returns {Promise} A Promise that resolves to true if role1 is higher in hierarchy than role2, or false otherwise.
     */
    async roleIsBigger(roles, role1, role2){
        role1 = roles.findIndex(r => r.rid == role1);
        role2 = roles.findIndex(r => r.rid == role2);
        return role1 < role2; //true if role1 is important
    }

    /**
     * Check if a user has the permission to edit a role.
     * @param {string} user - The user identifier.
     * @param {string} roleId - The role identifier to edit.
     * @returns {Promise} A Promise that resolves to true if the user has permission to edit the role, or false if not.
     */
    async userHasEditRole(user, roleId){
        const roles = await this.getRoles();
        const role = roles.find(r => r.rid == roleId);
        if(!role) return false;

        const userRoles = await this.getUserRoles(user);
        if(userRoles.length == 0) return false;
        const bigger = userRoles[0];
        return await this.roleIsBigger(roles, bigger, role);
    }
}

export default permissionSystem;