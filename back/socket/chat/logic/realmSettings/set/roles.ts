import Db_RealmRoles from "#types/db/realmRoles";
import { processDbChanges, PermissionSystem, Id, Socket_RealmSettings, Socket_User } from "./imports";

export default async (id: Id, data: Socket_RealmSettings, suser: Socket_User) => {
    const permSys = new PermissionSystem(id);
    const oldRoles: Db_RealmRoles.role[] = await permSys.getAllRolesSorted();
    const newRoles = data.roles;
    const changes = processDbChanges(oldRoles, newRoles, ["lvl", "name", "c", "p"], "_id");

    const itemsToAdd = changes.itemsToAdd;
    const itemsToRemove = changes.itemsToRemove;
    const itemsToUpdate = changes.itemsToUpdate;
    processRoleUpdate(oldRoles, itemsToUpdate);
    
    for(const role of itemsToRemove){
        await permSys.deleteRole(role._id, suser._id);        
    }

    if(itemsToRemove.length > 0 && data.users){
        const rids = itemsToRemove.map(role => role._id);
        for(const user of data.users){
            for(const rid of rids){
                user.r = user.r.filter(r => r !== rid);
            }
        }
    }

    for(const role of itemsToAdd){
        await permSys.createRole(
            role.name,
            {
                p: role.p || 0,
                lvl: role.lvl || null, 
                c: role.c || "#fff",
                managerId: suser._id
            }
        )
    }

    for(const role of itemsToUpdate){
        await permSys.updateRole(role._id, role, suser._id);
    }
}

function processRoleUpdate(oldRoles: Db_RealmRoles.role[], itemsToUpdate){
    itemsToUpdate.forEach(role => {
        const old = oldRoles.find(r => r._id === role._id);
        if(role.lvl === old.lvl) delete role.lvl;
        if(role.name === old.name) delete role.name;
        if(role.c === old.c) delete role.c;
        if(role.p === old.p) delete role.p;
    })
}