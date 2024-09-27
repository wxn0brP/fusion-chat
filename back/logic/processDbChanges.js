/**
 * Processes changes in two arrays of objects, returning three arrays:
 * itemsToAdd - objects present in newData but not in oldData
 * itemsToRemove - objects present in oldData but not in newData
 * itemsToUpdate - objects present in both arrays but with different values in tracked properties
 * itemsWithRemovedFields - objects present in newData but with deleted fields
 *
 * @param {Array[object]} oldData - array of objects representing the old data
 * @param {Array[object]} newData - array of objects representing the new data
 * @param {Array[string]} [trackParams=[]] - array of properties to track for updates
 * @param {string} [idName="_id"] - property name to use as id
 * @return {Object} an object with three properties: itemsToAdd, itemsToRemove, itemsToUpdate
 */
export default function processDbChanges(oldData, newData, trackParams=[], idName="_id"){
    const itemsToAdd = newData.filter(newItem => !oldData.some(oldItem => oldItem[idName] === newItem[idName]));
    const itemsToRemove = oldData.filter(oldItem => !newData.some(newItem => newItem[idName] === oldItem[idName]));
    const itemsToUpdate = newData.filter(newItem => {
        const oldItem = oldData.find(oldItem => oldItem[idName] === newItem[idName]);
        return oldItem && !areObjectsEqual(newItem, oldItem, trackParams);
    });

    const itemsWithRemovedFields = itemsToUpdate.map(newItem => {
        const oldItem = oldData.find(oldItem => oldItem[idName] === newItem[idName]);
        const deletedParams = findDeletedParams(oldItem, newItem, trackParams);
        return { [idName]: newItem[idName], deletedParams };
    }).filter(item => item.deletedParams.length > 0);

    return { itemsToAdd, itemsToRemove, itemsToUpdate, itemsWithRemovedFields };
}

/**
 * Checks if two objects are equal on given properties.
 * @param {Object} obj1 - the first object
 * @param {Object} obj2 - the second object
 * @param {Array<string>} params - the properties to check
 * @return {boolean} true if the objects are equal on all given properties
 */
function areObjectsEqual(obj1, obj2, params){
    return params.every(param => {
        if(Array.isArray(obj1[param])){
            return Array.isArray(obj1[param]) && Array.isArray(obj2[param]) &&
                    obj1[param].length === obj2[param].length &&
                    obj1[param].every(value => obj2[param].includes(value));
        }
        return obj1[param] === obj2[param]
    });
}

/**
 * Finds properties present in oldItem but not in newItem in params.
 * @param {Object} oldItem - the old item
 * @param {Object} newItem - the new item
 * @param {Array<string>} params - the properties to check
 * @returns {Array<string>} an array of properties that were deleted
 */
function findDeletedParams(oldItem, newItem, params){
    return params.filter(param => !(param in newItem) && (param in oldItem));
}