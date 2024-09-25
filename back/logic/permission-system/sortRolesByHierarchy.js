/**
 * Sorts an array of roles based on their parent-child relationships.
 *
 * @param {Array} rolesArray - An array of role objects with 'rid' and 'parent' properties.
 * @returns {Array|boolean} - An array of sorted roles or false if invalid relationships are detected.
 */
export default function sortRoles(rolesArray){
    const sortedRoles = [];
    const seenRoleIds = {};
    const seenParents = {};

    for(const role of rolesArray){
        if(seenRoleIds[role.rid] || seenParents[role.parent]) return false;
        seenRoleIds[role.rid] = true;
        seenParents[role.parent] = true;
    }

    const topLevelRole = rolesArray.find(role => role.parent === "all");

    function traverseAndSort(role){
        sortedRoles.push(role);
        const childRole = rolesArray.find(child => child.parent === role.rid);

        if(childRole) traverseAndSort(childRole);
    }

    if(topLevelRole) traverseAndSort(topLevelRole);
    else return false;

    return sortedRoles;
}