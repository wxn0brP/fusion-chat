import { existsSync, promises } from "fs";
import { pathRepair, createRL } from "./utils.js";
import { parse } from "../format.js";
import { hasFieldsAdvanced, updateFindObject } from "../more.js";

/**
 * Processes a line of text from a file and checks if it matches the search criteria.
 * @private
 * @param {function|Object} arg - The search criteria. It can be a function or an object.
 * @param {string} line - The line of text from the file.
 * @param {Object} context - The context object (for functions).
 * @param {Object} findOpts - Update result object with findOpts options.
 * @returns {Promise<Object|null>} A Promise that resolves to the matching object or null.
 */
async function findProcesLine(arg, line, context={}, findOpts={}){
    const ob = parse(line);
    let res = false;
    
    if(typeof arg === "function"){
        if(arg(ob, context)) res = true;
    }else if(typeof arg === "object" && !Array.isArray(arg)){
        if(hasFieldsAdvanced(ob, arg)) res = true;
    }

    if(res) return updateFindObject(ob, findOpts);
    return null;
}

/**
 * Asynchronously finds entries in a file based on search criteria.
 * @function
 * @param {string} file - The file path to search in.
 * @param {function|Object} arg - The search criteria. It can be a function or an object.
 * @param {Object} context - The context object (for functions).
 * @param {Object} findOpts - Update result object with findOpts options.
 * @returns {Promise<Object[]>} A Promise that resolves to an array of matching objects.
 */
export async function find(file, arg, context={}, findOpts={}){
    file = pathRepair(file);
    return await new Promise(async (resolve) => {
        if(!existsSync(file)){
            await promises.writeFile(file, "");
            resolve(false);
            return;
        }
        const rl = createRL(file);
        const resF = [];
        for await(const line of rl){
            if(line == "" || !line) continue;

            const res = await findProcesLine(arg, line, context, findOpts);
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
 * @param {Object} findOpts - Update result object with findOpts options.
 * @returns {Promise<Object>} A Promise that resolves to the first matching object found or an empty array.
 */
export async function findOne(file, arg, context={}, findOpts={}){
    file = pathRepair(file);
    return await new Promise(async (resolve) => {
        if(!existsSync(file)){
            await promises.writeFile(file, "");
            resolve(false);
            return;
        }
        const rl = createRL(file);
        for await(const line of rl){
            if(line == "" || !line) continue;

            const res = await findProcesLine(arg, line, context, findOpts);
            if(res){
                resolve(res);
                rl.close();
            }
        };
        resolve(false);
    });
}