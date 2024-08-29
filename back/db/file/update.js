const fs = require("fs");
const { pathRepair, createRL } = require("./utils");
const format = require("../format");
const more = require("../more");

/**
 * Updates a file based on search criteria and an updater function or object.
 * @private
 * @param {string} file - The file path to update.
 * @param {function|Object} search - The search criteria. It can be a function or an object.
 * @param {function|Object} updater - The updater function or object.
 * @param {boolean} [one=false] - Indicates whether to update only one matching entry (default: false).
 * @returns {Promise<boolean>} A Promise that resolves to `true` if the file was updated, or `false` otherwise.
 */
async function updateWorker(file, search, updater, one=false){
    file = pathRepair(file);
    if(!fs.existsSync(file)){
        await fs.promises.writeFile(file, "");
        return false;
    }
    await fs.promises.copyFile(file, file+".tmp");
    await fs.promises.writeFile(file, "");

    const rl = createRL(file+".tmp");
  
    let updated = false;
    for await(let line of rl){
        if(one && updated){
            fs.appendFileSync(file, line+"\n");
            continue;
        }

        const data = format.parse(line);
        let ob = false;

        if(typeof search === "function"){
            ob = search(data) || false;
        }else if(typeof search === "object" && !Array.isArray(search)){
            ob = more.hasFieldsAdvanced(data, search);
        }

        if(ob){
            let updateObj;
            if(typeof updater === "function"){
                updateObj = updater(data);
            }else if(typeof updater === "object" && !Array.isArray(updater)){
                updateObj = more.updateObject(data, updater);
            }
            line = await format.stringify(updateObj);
            updated = true;
        }
        
        fs.appendFileSync(file, line+"\n");
    }
    await fs.promises.writeFile(file+".tmp", "");
    return updated;
}

/**
 * Asynchronously updates entries in a file based on search criteria and an updater function or object.
 * @function
 * @param {string} folder - The folder containing the file.
 * @param {string} name - The name of the file to update.
 * @param {function|Object} arg - The search criteria. It can be a function or an object.
 * @param {function|Object} obj - The updater function or object.
 * @param {boolean} one - Indicates whether to update only one matching entry (default: false).
 * @returns {Promise<boolean>} A Promise that resolves to `true` if entries were updated, or `false` otherwise.
 */
async function update(folder, name, arg, obj, one){
    let files = fs.readdirSync(folder + "/" + name).filter(file => !/\.tmp$/.test(file));
    files.reverse();
    let update = false;
    for(const file of files){
        const updated = await updateWorker(folder + "/" + name + "/" + file, arg, obj, one);
        if(one && updated) return true;
        update = update || updated;
    }
    return update;
}

module.exports = update;