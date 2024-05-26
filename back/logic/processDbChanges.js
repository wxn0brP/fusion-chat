function processDbChanges(oldData, newData, trackParams = [], idName="_id"){
    // Helper function to check if objects are equal based on trackParams
    const areObjectsEqual = (obj1, obj2, params) => {
        return params.every(param => obj1[param] === obj2[param]);
    };

    const itemsToAdd = newData.filter(newItem => !oldData.some(oldItem => oldItem[idName] === newItem[idName]));
    const itemsToRemove = oldData.filter(oldItem => !newData.some(newItem => newItem[idName] === oldItem[idName]));
    const itemsToUpdate = newData.filter(newItem => {
        const oldItem = oldData.find(oldItem => oldItem[idName] === newItem[idName]);
        return oldItem && !areObjectsEqual(newItem, oldItem, trackParams);
    });

    return { itemsToAdd, itemsToRemove, itemsToUpdate };
}

module.exports = processDbChanges;