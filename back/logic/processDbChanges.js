export default function processDbChanges(oldData, newData, trackParams = [], idName="_id"){
    // Helper function to check if objects are equal based on trackParams
    const areObjectsEqual = (obj1, obj2, params) => {
        return params.every(param => {
            if(Array.isArray(obj1[param])){
                return Array.isArray(obj1[param]) && Array.isArray(obj2[param]) &&
                        obj1[param].length === obj2[param].length &&
                        obj1[param].every(value => obj2[param].includes(value));
            }
            return obj1[param] === obj2[param]
        });
    };

    const itemsToAdd = newData.filter(newItem => !oldData.some(oldItem => oldItem[idName] === newItem[idName]));
    const itemsToRemove = oldData.filter(oldItem => !newData.some(newItem => newItem[idName] === oldItem[idName]));
    const itemsToUpdate = newData.filter(newItem => {
        const oldItem = oldData.find(oldItem => oldItem[idName] === newItem[idName]);
        return oldItem && !areObjectsEqual(newItem, oldItem, trackParams);
    });

    return { itemsToAdd, itemsToRemove, itemsToUpdate };
}