import { processDbChanges, PermissionSystem } from "./imports.js";
export default async (id, data, suser) => {
    const permSys = new PermissionSystem(id);
    const oldRoles = await permSys.getAllRolesSorted();
    const newRoles = data.roles;
    const changes = processDbChanges(oldRoles, newRoles, ["lvl", "name", "c", "p"], "_id");
    const itemsToAdd = changes.itemsToAdd;
    const itemsToRemove = changes.itemsToRemove;
    const itemsToUpdate = changes.itemsToUpdate;
    processRoleUpdate(oldRoles, itemsToUpdate);
    for (const role of itemsToRemove) {
        await permSys.deleteRole(role._id, suser._id);
    }
    if (itemsToRemove.length > 0 && data.users) {
        const rids = itemsToRemove.map(role => role._id);
        for (const user of data.users) {
            for (const rid of rids) {
                user.r = user.r.filter(r => r !== rid);
            }
        }
    }
    for (const role of itemsToAdd) {
        await permSys.createRole(role.name, {
            p: role.p || 0,
            lvl: role.lvl || null,
            c: role.c || "#fff",
            managerId: suser._id
        });
    }
    for (const role of itemsToUpdate) {
        await permSys.updateRole(role._id, role, suser._id);
    }
};
function processRoleUpdate(oldRoles, itemsToUpdate) {
    itemsToUpdate.forEach(role => {
        const old = oldRoles.find(r => r._id === role._id);
        if (role.lvl === old.lvl)
            delete role.lvl;
        if (role.name === old.name)
            delete role.name;
        if (role.c === old.c)
            delete role.c;
        if (role.p === old.p)
            delete role.p;
    });
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm9sZXMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9iYWNrL3NvY2tldC9jaGF0L2xvZ2ljL3JlYWxtU2V0dGluZ3Mvc2V0L3JvbGVzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUNBLE9BQU8sRUFBRSxnQkFBZ0IsRUFBRSxnQkFBZ0IsRUFBeUMsTUFBTSxXQUFXLENBQUM7QUFFdEcsZUFBZSxLQUFLLEVBQUUsRUFBTSxFQUFFLElBQTBCLEVBQUUsS0FBa0IsRUFBRSxFQUFFO0lBQzVFLE1BQU0sT0FBTyxHQUFHLElBQUksZ0JBQWdCLENBQUMsRUFBRSxDQUFDLENBQUM7SUFDekMsTUFBTSxRQUFRLEdBQXlCLE1BQU0sT0FBTyxDQUFDLGlCQUFpQixFQUFFLENBQUM7SUFDekUsTUFBTSxRQUFRLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQztJQUM1QixNQUFNLE9BQU8sR0FBRyxnQkFBZ0IsQ0FBQyxRQUFRLEVBQUUsUUFBUSxFQUFFLENBQUMsS0FBSyxFQUFFLE1BQU0sRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFDLEVBQUUsS0FBSyxDQUFDLENBQUM7SUFFdkYsTUFBTSxVQUFVLEdBQUcsT0FBTyxDQUFDLFVBQVUsQ0FBQztJQUN0QyxNQUFNLGFBQWEsR0FBRyxPQUFPLENBQUMsYUFBYSxDQUFDO0lBQzVDLE1BQU0sYUFBYSxHQUFHLE9BQU8sQ0FBQyxhQUFhLENBQUM7SUFDNUMsaUJBQWlCLENBQUMsUUFBUSxFQUFFLGFBQWEsQ0FBQyxDQUFDO0lBRTNDLEtBQUksTUFBTSxJQUFJLElBQUksYUFBYSxFQUFDLENBQUM7UUFDN0IsTUFBTSxPQUFPLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxHQUFHLEVBQUUsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0lBQ2xELENBQUM7SUFFRCxJQUFHLGFBQWEsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxJQUFJLElBQUksQ0FBQyxLQUFLLEVBQUMsQ0FBQztRQUN2QyxNQUFNLElBQUksR0FBRyxhQUFhLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQ2pELEtBQUksTUFBTSxJQUFJLElBQUksSUFBSSxDQUFDLEtBQUssRUFBQyxDQUFDO1lBQzFCLEtBQUksTUFBTSxHQUFHLElBQUksSUFBSSxFQUFDLENBQUM7Z0JBQ25CLElBQUksQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEtBQUssR0FBRyxDQUFDLENBQUM7WUFDM0MsQ0FBQztRQUNMLENBQUM7SUFDTCxDQUFDO0lBRUQsS0FBSSxNQUFNLElBQUksSUFBSSxVQUFVLEVBQUMsQ0FBQztRQUMxQixNQUFNLE9BQU8sQ0FBQyxVQUFVLENBQ3BCLElBQUksQ0FBQyxJQUFJLEVBQ1Q7WUFDSSxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDO1lBQ2QsR0FBRyxFQUFFLElBQUksQ0FBQyxHQUFHLElBQUksSUFBSTtZQUNyQixDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUMsSUFBSSxNQUFNO1lBQ25CLFNBQVMsRUFBRSxLQUFLLENBQUMsR0FBRztTQUN2QixDQUNKLENBQUE7SUFDTCxDQUFDO0lBRUQsS0FBSSxNQUFNLElBQUksSUFBSSxhQUFhLEVBQUMsQ0FBQztRQUM3QixNQUFNLE9BQU8sQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLEdBQUcsRUFBRSxJQUFJLEVBQUUsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0lBQ3hELENBQUM7QUFDTCxDQUFDLENBQUE7QUFFRCxTQUFTLGlCQUFpQixDQUFDLFFBQThCLEVBQUUsYUFBYTtJQUNwRSxhQUFhLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxFQUFFO1FBQ3pCLE1BQU0sR0FBRyxHQUFHLFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsR0FBRyxLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUNuRCxJQUFHLElBQUksQ0FBQyxHQUFHLEtBQUssR0FBRyxDQUFDLEdBQUc7WUFBRSxPQUFPLElBQUksQ0FBQyxHQUFHLENBQUM7UUFDekMsSUFBRyxJQUFJLENBQUMsSUFBSSxLQUFLLEdBQUcsQ0FBQyxJQUFJO1lBQUUsT0FBTyxJQUFJLENBQUMsSUFBSSxDQUFDO1FBQzVDLElBQUcsSUFBSSxDQUFDLENBQUMsS0FBSyxHQUFHLENBQUMsQ0FBQztZQUFFLE9BQU8sSUFBSSxDQUFDLENBQUMsQ0FBQztRQUNuQyxJQUFHLElBQUksQ0FBQyxDQUFDLEtBQUssR0FBRyxDQUFDLENBQUM7WUFBRSxPQUFPLElBQUksQ0FBQyxDQUFDLENBQUM7SUFDdkMsQ0FBQyxDQUFDLENBQUE7QUFDTixDQUFDIn0=