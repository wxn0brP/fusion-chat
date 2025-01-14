export type Item = { [key: string]: any };

export interface ProcessDbChangesResult {
    itemsToAdd: Item[];
    itemsToRemove: Item[];
    itemsToUpdate: Item[];
    itemsWithRemovedFields: Item[];
}

/**
 * Processes changes in two arrays of objects, returning three arrays:
 * - itemsToAdd - objects present in newData but not in oldData
 * - itemsToRemove - objects present in oldData but not in newData
 * - itemsToUpdate - objects present in both arrays but with different values in tracked properties
 * - itemsWithRemovedFields - objects present in newData but with deleted fields
 *
 * @param oldData - array of objects representing the old data
 * @param newData - array of objects representing the new data
 * @param trackParams - array of properties to track for updates
 * @param idName - property name to use as id
 * @returns an object with four properties: itemsToAdd, itemsToRemove, itemsToUpdate, itemsWithRemovedFields
 */
export default function processDbChanges<T extends Item>(
    oldData: T[],
    newData: T[],
    trackParams: string[] = [],
    idName: string = "_id"
): ProcessDbChangesResult {
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
 * @param obj1 - the first object
 * @param obj2 - the second object
 * @param params - the properties to check
 * @returns true if the objects are equal on all given properties
 */
function areObjectsEqual(obj1: Item, obj2: Item, params: string[]): boolean {
    return params.every(param => {
        if (Array.isArray(obj1[param])) {
            return Array.isArray(obj1[param]) && Array.isArray(obj2[param]) &&
                obj1[param].length === obj2[param].length &&
                obj1[param].every(value => obj2[param].includes(value));
        }
        return obj1[param] === obj2[param];
    });
}

/**
 * Finds properties present in oldItem but not in newItem in params.
 * @param oldItem - the old item
 * @param newItem - the new item
 * @param params - the properties to check
 * @returns an array of properties that were deleted
 */
function findDeletedParams(oldItem: Item, newItem: Item, params: string[]): string[] {
    return params.filter(param => !(param in newItem) && (param in oldItem));
}
