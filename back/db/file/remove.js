const fs = require("fs");
const { pathRepair, createRL } = require("./utils");
const format = require("../format");
const more = require("../more");

/**
 * Removes entries from a file based on search criteria.
 * @private
 * @param {string} file - The file path to remove entries from.
 * @param {function|Object} search - The search criteria. It can be a function or an object.
 * @param {Object} context - The context object (for functions).
 * @param {boolean} [one=false] - Indicates whether to remove only one matching entry (default: false).
 * @returns {Promise<boolean>} A Promise that resolves to `true` if entries were removed, or `false` otherwise.
 */
async function removeWorker(file, search, context={}, one=false){
    file = pathRepair(file);
    if(!fs.existsSync(file)){
        await fs.promises.writeFile(file, "");
        return false;
    }
    await fs.promises.copyFile(file, file+".tmp");
    await fs.promises.writeFile(file, "");

    const rl = createRL(file+".tmp");
  
    let removed = false;
    for await(let line of rl){
        if(one && removed){
            fs.appendFileSync(file, line+"\n");
            continue;
        }

        const data = format.parse(line);

        if(typeof search === "function"){
            if(search(data, context)){
                removed = true;
                continue;
            }
        }else if(typeof search === "object" && !Array.isArray(search)){
            if(more.hasFieldsAdvanced(data, search)){
                removed = true;
                continue;
            }
        }
        
        fs.appendFileSync(file, line+"\n");
    }
    await fs.promises.writeFile(file+".tmp", "");
    return removed;
}

/**
 * Asynchronously removes entries from a file based on search criteria.
 * @function
 * @param {string} folder - The folder containing the file.
 * @param {string} name - The name of the file to remove entries from.
 * @param {function|Object} arg - The search criteria. It can be a function or an object.
 * @param {Object} context - The context object (for functions).
 * @param {boolean} one - Indicates whether to remove only one matching entry (default: false).
 * @returns {Promise<boolean>} A Promise that resolves to `true` if entries were removed, or `false` otherwise.
 */
async function remove(folder, name, arg, context={}, one){
    let files = fs.readdirSync(folder + "/" + name).filter(file => !/\.tmp$/.test(file));
    files.reverse();
    let remove = false;
    for(const file of files){
        const removed = await removeWorker(folder + "/" + name + "/" + file, arg, context, one);
        if(one && removed) break;
        remove = remove || removed;
    }
    return remove;
}

module.exports = remove;