function sortUserRolesByHierarchy(rolesArray, userRoles){
    const sortedRoles = [];
    for(const role of rolesArray){
        const rid = role.rid;
        if(userRoles.includes(rid)) sortedRoles.push(rid);
    }
    return sortedRoles;
}

module.exports = sortUserRolesByHierarchy