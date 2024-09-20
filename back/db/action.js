const fs = require("fs");
const gen = require("./gen");
const format = require("./format");
const fileM = require("./file");
// const CacheManager = require("./cacheManager");

const maxFileSize = 2 * 1024 * 1024; //2 MB

/**
 * A class representing database actions on files.
 * @class
 */
class dbActionC{
    /**
     * Creates a new instance of dbActionC.
     * @constructor
     * @param {string} folder - The folder where database files are stored.
     * @param {object} options - The options object.
     */
    constructor(folder, options){
        this.folder = folder;
        // this.cacheManager = new CacheManager(options.cacheThreshold, options.cacheTTL);
        
        if(!fs.existsSync(folder)) fs.mkdirSync(folder, { recursive: true });
    }

    /**
     * Get a list of available databases in the specified folder.
     * @returns {string[]} An array of database names.
     */
    getDBs(){
        const collections = fs.readdirSync(this.folder, { recursive: true, withFileTypes: true })
            .filter(dirent => dirent.isDirectory())
            .map(dirent => {
                if(dirent.parentPath === this.folder) return dirent.name;
                return dirent.parentPath.replace(this.folder + "/", "") + "/" + dirent.name
            });

        return collections;
    }

    /**
     * Check and create the specified collection if it doesn't exist.
     * @function
     * @param {string} collection - The collection to check.
     */
    checkCollection(collection){
        const path = this.folder + "/" + collection;
        if(!fs.existsSync(path)) fs.mkdirSync(path, { recursive: true });
    }

    /**
     * Add a new entry to the specified database.
     * @async
     * @param {string} collection - The name of the collection.
     * @param {Object} arg - The data to be added to the database.
     * @param {boolean} id_gen - Whether to generate an ID for the entry. Default is true.
     * @returns {Promise<Object>} A Promise that resolves to the added data.
     */
    async add(collection, arg, id_gen=true){
        this.checkCollection(collection);
        const file = this.folder + "/" + collection + "/" + getLastFile(this.folder + "/" + collection);

        if(id_gen) arg._id = arg._id || gen();
        const data = format.stringify(arg);
        fs.appendFileSync(file, data+"\n");
        return arg;
    }

    /**
     * Find entries in the specified database based on search criteria.
     * @async
     * @param {string} collection - The name of the collection.
     * @param {function|Object} arg - The search criteria. It can be a function or an object.
     * @param {Object} context - The context object (for functions).
     * @param {Object} options - The options for the search.
     * @param {number} options.max - The maximum number of entries to return. Default is -1, meaning no limit.
     * @param {boolean} options.reverse - Whether to reverse the order of returned entries. Default is false.
     * @returns {Promise<Object[]>} A Promise that resolves to an array of matching entries.
     */
    async find(collection, arg, context={}, options={}){
        options.reverse = options.reverse || false;
        options.max = options.max || -1;

        this.checkCollection(collection);
        const files = getSortedFiles(this.folder + "/" + collection).map(f => f.f);
        if(options.reverse) files.reverse();
        let datas = [];

        let totalEntries = 0;

        for(let f of files){
            let data = await fileM.find(this.folder + "/" + collection + "/" + f, arg, context, options);
            if(options.reverse) data.reverse();

            if(options.max !== -1){
                if(totalEntries + data.length > options.max){
                    let remainingEntries = options.max - totalEntries;
                    data = data.slice(0, remainingEntries);
                    totalEntries = options.max;
                }else{
                    totalEntries += data.length;
                }
            }

            datas = datas.concat(data);

            if(options.max !== -1 && totalEntries >= options.max) break;
        }
        return datas;
    }

    /**
     * Find the first matching entry in the specified database based on search criteria.
     * @async
     * @param {string} collection - Name of the database collection.
     * @param {function|Object} arg - The search criteria. It can be a function or an object.
     * @param {Object} context - The context object (for functions).
     * @returns {Promise<Object|null>} A Promise that resolves to the first matching entry or null if not found.
     */
    async findOne(collection, arg, context={}){
        this.checkCollection(collection);
        const files = getSortedFiles(this.folder + "/" + collection).map(f => f.f);
        files.reverse();

        for(let f of files){
            let data = await fileM.findOne(this.folder + "/" + collection + "/" + f, arg, context);
            if(data){
                return data;
            }
        }
        return null;
    }

    /**
     * Update entries in the specified database based on search criteria and an updater function or object.
     * @async
     * @param {string} collection - Name of the database collection.
     * @param {function|Object} arg - The search criteria. It can be a function or an object.
     * @param {function|Object} obj - The updater function or object.
     * @param {Object} context - The context object (for functions).
     * @returns {Promise<boolean>} A Promise that resolves to `true` if entries were updated, or `false` otherwise.
     */
    async update(collection, arg, obj, context={}){
        this.checkCollection(collection);
        return await fileM.update(this.folder, collection, arg, obj, context);
    }

    /**
     * Update the first matching entry in the specified database based on search criteria and an updater function or object.
     * @async
     * @param {string} collection - Name of the database collection.
     * @param {function|Object} arg - The search criteria. It can be a function or an object.
     * @param {function|Object} obj - The updater function or object.
     * @param {Object} context - The context object (for functions).
     * @returns {Promise<boolean>} A Promise that resolves to `true` if one entry was updated, or `false` otherwise.
     */
    async updateOne(collection, arg, obj, context={}){
        this.checkCollection(collection);
        return await fileM.update(this.folder, collection, arg, obj, context, true);
    }

    /**
     * Remove entries from the specified database based on search criteria.
     * @async
     * @param {string} collection - Name of the database collection.
     * @param {function|Object} arg - The search criteria. It can be a function or an object.
     * @param {Object} context - The context object (for functions).
     * @returns {Promise<boolean>} A Promise that resolves to `true` if entries were removed, or `false` otherwise.
     */
    async remove(collection, arg, context={}){
        this.checkCollection(collection);
        return await fileM.remove(this.folder, collection, arg, context);
    }

    /**
     * Remove the first matching entry from the specified database based on search criteria.
     * @async
     * @param {string} collection - Name of the database collection.
     * @param {function|Object} arg - The search criteria. It can be a function or an object.
     * @param {Object} context - The context object (for functions).
     * @returns {Promise<boolean>} A Promise that resolves to `true` if one entry was removed, or `false` otherwise.
     */
    async removeOne(collection, arg, context={}){
        this.checkCollection(collection);
        return await fileM.remove(this.folder, collection, arg, context, true);
    }

    /**
     * Removes a database collection from the file system.
     *
     * @param {string} collection - The name of the collection to remove.
     * @return {void}
     */
    removeDb(collection){
        fs.rmSync(this.folder + "/" + collection, { recursive: true, force: true });
    }
}

/**
 * Get the last file in the specified directory.
 * @param {string} path - The directory path.
 * @returns {string} The name of the last file in the directory.
 */
function getLastFile(path){
    if(!fs.existsSync(path)) fs.mkdirSync(path, { recursive: true });
    const files = getSortedFiles(path);

    if(files.length == 0){
        fs.writeFileSync(path+"/1.db", "");
        return "1.db";
    }

    const last = files[files.length-1];
    const info = path + "/" + last.f;

    if(fs.statSync(info).size < maxFileSize) return last.f;
    
    const num = last.i + 1;
    fs.writeFileSync(path + "/" + num + ".db", "");
    return num+".db";
}

/**
 * Get all files in a directory sorted by name.
 * @param {string} path - The path to the directory.
 * @return {string[]} An array of file names sorted by name.
 */
function getSortedFiles(path){
    let files = fs.readdirSync(path).filter(file => file.endsWith(".db"));
    if(files.length == 0) return [];
    files = files.map(file => parseInt(file.replace(".db", "")))
    files = files.sort();
    files = files.map(file => { return { i: file, f: file+".db" } });
    return files;
}

module.exports = dbActionC;