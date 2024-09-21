import Ajv from "ajv";
import ajvFormat from "ajv-formats";

const ajv = new Ajv();
ajvFormat(ajv);

const valid = {
    /**
     * Check if a value is a string within a specified length range.
     *
     * @function
     * @param {string} str - The string to validate.
     * @param {number} [min=0] - Minimum length of the string.
     * @param {number} [max=Infinity] - Maximum length of the string.
     * @returns {boolean} True if the string is within the specified length range, false otherwise.
     */
    str(str, min=0, max=Infinity){
        return typeof str == "string" && str.length >= min && str.length <= max;
    },

    /**
     * Check if a value is a number.
     *
     * @function
     * @param {number} data - The number to validate.
     * @param {number} [min=0] - Minimum value of the number.
     * @param {number} [max=Infinity] - Maximum value of the number.
     * @returns {boolean} True if the value is a number, false otherwise.
     */
    num(data, min=0, max=Infinity){
        return typeof data == "number" && data >= min && data <= max;
    },
  
    /**
     * Check if an array contains only values of a specified type.
     *
     * @function
     * @param {Array} arr - The array to validate.
     * @param {string} type - The expected type of the array values.
     * @returns {boolean} True if the array contains only values of the specified type, false otherwise.
     */
    arrayContainsOnlyType(arr, type){
        if(!Array.isArray(arr)) return false;
        for(const value of arr){
            if(typeof value !== type) return false;
        }
        return true;
    },

    /**
     * Check if an array contains only strings within a specified length range.
     *
     * @function
     * @param {Array} arr - The array of strings to validate.
     * @param {number} [min=0] - Minimum length of each string in the array.
     * @param {number} [max=Infinity] - Maximum length of each string in the array.
     * @returns {boolean} True if the array contains only valid strings, false otherwise.
     */
    arrayString(arr, min=0, max=Infinity){
        if(!Array.isArray(arr)) return false;
        for(const value of arr){
            if(!this.str(value, min, max)) return false;
        }
        return true;
    },

    /**
     * Validate an object against a provided schema or check if it's a plain object.
     *
     * @function
     * @param {Object} schema - A schema to validate the object against.
     * @returns {Object} An Ajv schema object.
     */
    objAjv(schema){
        return ajv.compile(schema);
    },

    /**
     * Check if an id is valid.
     *
     * @function
     * @param {string} id - The id to validate.
     * @returns {boolean} True if the id is valid, false otherwise.
     */
    id(id){
        if(typeof id !== "string") return false;
        if(id.startsWith("$")) id = id.replace("$", "");
        
        const parts = id.split("-");
        if(parts.length != 3) return false;

        const regex = /^[a-z0-9]+$/;
        for(const part of parts){
            if(!regex.test(part)) return false;
        }
        return true;
    },

    /**
     * Check if a value is a valid id or is included in a list of specific strings.
     *
     * @function
     * @param {string} data - The value to validate.
     * @param {string[]} strs - List of specific strings that are allowed.
     * @returns {boolean} True if the value is a valid id or is included in the list of specific strings, false otherwise.
     */
    idOrSpecyficStr(data, strs=[]){
        if(this.id(data)) return true;
        return strs.includes(data);
    },

    /**
     * Check if a value is a boolean.
     *
     * @function
     * @param {boolean} data - The boolean to validate.
     * @returns {boolean} True if the value is a boolean, false otherwise.
     */
    bool(data){
        return typeof data == "boolean";
    }
}

export default valid;

ajv.addKeyword({
    keyword: "channelRP",
    type: "string",
    compile: function(){
        return function(data){
            const parts = data.split('/');
            if(parts.length !== 2) return false;
            
            const [id, perm] = parts;
            const validPerms = ["text", "visable"];

            return valid.id(id) && validPerms.includes(perm);
        };
    },
});

ajv.addKeyword({
    keyword: "validId",
    type: "string",
    compile: function(){
        return valid.id;
    },
});