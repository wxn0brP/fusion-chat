const fs = require("fs");
const { pathRepair, createRL } = require("./utils");
const format = require("../format");
const more = require("../more");

/**
 * Processes a line of text from a file and checks if it matches the search criteria.
 * @private
 * @param {function|Object} arg - The search criteria. It can be a function or an object.
 * @param {string} line - The line of text from the file.
 * @param {Object} context - The context object (for functions).
 * @returns {Promise<Object|null>} A Promise that resolves to the matching object or null.
 */
async function findProcesLine(arg, line, context={}){
    const ob = format.parse(line);
    let res = false;
    
    if(typeof arg === "function"){
        if(arg(ob, context)) res = true;
    }else if(typeof arg === "object" && !Array.isArray(arg)){
        if(more.hasFieldsAdvanced(ob, arg)) res = true;
    }

    return res ? ob : null;
}

/**
 * Asynchronously finds entries in a file based on search criteria.
 * @function
 * @param {string} file - The file path to search in.
 * @param {function|Object} arg - The search criteria. It can be a function or an object.
 * @param {Object} context - The context object (for functions).
 * @returns {Promise<Object[]>} A Promise that resolves to an array of matching objects.
 */
async function find(file, arg, context={}){
    file = pathRepair(file);
    return await new Promise(async (resolve) => {
        if(!fs.existsSync(file)){
            await fs.promises.writeFile(file, "");
            resolve(false);
            return;
        }
        const rl = createRL(file);
        const resF = [];
        for await(const line of rl){
            if(line == "" || !line) continue;

            const res = await findProcesLine(arg, line, context);
            if(res) resF.push(res); 
        };
        resolve(resF);
        rl.close();
    })
}

/**
 * Asynchronously finds one entry in a file based on search criteria.
 * @function
 * @param {string} file - The file path to search in.
 * @param {function|Object} arg - The search criteria. It can be a function or an object.
 * @param {Object} context - The context object (for functions).
 * @returns {Promise<Object>} A Promise that resolves to the first matching object found or an empty array.
 */
async function findOne(file, arg, context={}){
    file = pathRepair(file);
    return await new Promise(async (resolve) => {
        if(!fs.existsSync(file)){
            await fs.promises.writeFile(file, "");
            resolve(false);
            return;
        }
        const rl = createRL(file);
        for await(const line of rl){
            if(line == "" || !line) continue;

            const res = await findProcesLine(arg, line, context);
            if(res){
                resolve(res);
                rl.close();
            }
        };
        resolve(false);
    });
}

module.exports = {
    find,
    findOne
};