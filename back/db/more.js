/**
 * Checks if an object meets the criteria specified in the fields with operators.
 * @function
 * @param {Object} obj - The object to check.
 * @param {Object} fields - Criteria with operators.
 * @returns {boolean} - Whether the object meets the criteria.
 * @throws {Error} - If fields is not an object.
 */
export function hasFieldsAdvanced(obj, fields){
    if(typeof fields !== 'object' || fields === null){
        throw new Error("Fields must be an object");
    }
    
    if('$and' in fields){
        return fields['$and'].every(subFields => hasFieldsAdvanced(obj, subFields));
    }

    if('$or' in fields){
        return fields['$or'].some(subFields => hasFieldsAdvanced(obj, subFields));
    }

    if('$set' in fields){
        const setFields = fields['$set'];
        return hasFields(obj, setFields);
    }

    if('$not' in fields){
        return !hasFieldsAdvanced(obj, fields['$not']);
    }

    return hasFields(obj, fields);
}

/**
 * Checks if an object matches the standard field comparison.
 * @function
 * @param {Object} obj - The object to check.
 * @param {Object} fields - Criteria to compare.
 * @returns {boolean} - Whether the object matches the criteria.
 */
export function hasFields(obj, fields){
    const keys = Object.keys(fields);
    return keys.every(key => {
        if(obj[key]){
            if(typeof fields[key] === 'object' && fields[key] !== null){
                return hasFields(obj[key], fields[key]);
            }
            return obj[key] === fields[key];
        }
        return false;
    });
}

/**
 * Updates an object with new values.
 * @function
 * @param {Object} obj - The object to update.
 * @param {Object} newVal - An object containing new values to update in the target object.
 * @returns {Object} The updated object.
 */
export function updateObject(obj, newVal){
    for(let key in newVal){
        if(newVal.hasOwnProperty(key)){
            obj[key] = newVal[key];
        }
    }
    return obj;
}