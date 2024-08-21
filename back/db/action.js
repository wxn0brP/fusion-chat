/**
 * Db data operations
 * @module db/actions
 */

const fs = require("fs");
const gen = require("./gen");
const format = require("./format");
const fileM = require("./file");
const CacheManager = require("./cacheManager");

const maxFileSize = 2 * 1024 * 1024; //2 MB

/**
 * A class representing database actions on files.
 */
class dbActionC{
    /**
     * Creates a new instance of dbActionC.
     * @constructor
     * @param {string} folder - The folder where database files are stored.
     * @param {number} cacheThreshold - The cache threshold for query results.
     * @param {number} ttl - The time-to-live (TTL) for cached data.
     */
    constructor(folder, cacheThreshold, ttl){
        this.folder = folder;
        this.cacheManager = new CacheManager(cacheThreshold, ttl);
        
        if(!fs.existsSync(folder)) fs.mkdirSync(folder, { recursive: true });
    }

    /**
     * Get a list of available databases in the specified folder.
     * @returns {string[]} An array of database names.
     */
    getDBs(){
        return fs.readdirSync(this.folder);
    }

    /**
     * Check and create the specified directory if it doesn't exist.
     * @param {string} dir - The directory to check and create if necessary.
     */
    checkFile(dir){
        const path = this.folder + "/" + dir;
        if(!fs.existsSync(path)) fs.mkdirSync(path, { recursive: true });
    }

    /**
     * Add a new entry to the specified database.
     * @param {string} name - The name of the database.
     * @param {Object} arg - The data to be added to the database.
     * @param {boolean} id_gen - Whether to generate an ID for the entry. Default is true.
     * @returns {Promise<Object>} A Promise that resolves to the added data.
     */
    async add(name, arg, id_gen=true){
        this.checkFile(name);
        const file = this.folder + "/" + name + "/" + getLastFile(this.folder + "/" + name);

        if(id_gen) arg._id = arg._id || gen();
        const data = await format.stringify(arg);
        fs.appendFileSync(file, data+"\n");
        return arg;
    }

    /**
     * Find entries in the specified database based on search criteria.
     * @param {string} name - The name of the database.
     * @param {function|Object} arg - The search criteria. It can be a function or an object.
     * @param {Object} options - The options for the search.
     * @param {number} options.max - The maximum number of entries to return. Default is -1, meaning no limit.
     * @param {boolean} options.reverse - Whether to reverse the order of returned entries. Default is false.
     * @returns {Promise<Object[]>} A Promise that resolves to an array of matching entries.
     */
    async find(name, arg, options={}){
        options.reverse = options.reverse || false;
        options.max = options.max || -1;

        this.checkFile(name);
        let files = fs.readdirSync(this.folder + "/" + name).filter(file => !/\.tmp$/.test(file));
        if(options.reverse) files.reverse();
        let datas = [];

        let totalEntries = 0;

        for(let f of files){
            let data = await fileM.find(this.folder + "/" + name + "/" + f, arg, options);
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
     * @param {string} name - The name of the database.
     * @param {function|Object} arg - The search criteria. It can be a function or an object.
     * @returns {Promise<Object|null>} A Promise that resolves to the first matching entry or null if not found.
     */
    async findOne(name, arg){
        this.checkFile(name);
        let files = fs.readdirSync(this.folder + "/" + name).filter(file => !/\.tmp$/.test(file));
        files.reverse();

        for(let f of files){
            let data = await fileM.findOne(this.folder + "/" + name + "/" + f, arg);
            if(data){
                return data;
            }
        }
        return null;
    }

    /**
     * Update entries in the specified database based on search criteria and an updater function or object.
     * @param {string} name - The name of the database.
     * @param {function|Object} arg - The search criteria. It can be a function or an object.
     * @param {function|Object} obj - The updater function or object.
     * @returns {Promise<boolean>} A Promise that resolves to `true` if entries were updated, or `false` otherwise.
     */
    async update(name, arg, obj){
        this.checkFile(name);
        return await fileM.update(this.folder, name, arg, obj);
    }

    /**
     * Update the first matching entry in the specified database based on search criteria and an updater function or object.
     * @param {string} name - The name of the database.
     * @param {function|Object} arg - The search criteria. It can be a function or an object.
     * @param {function|Object} obj - The updater function or object.
     * @returns {Promise<boolean>} A Promise that resolves to `true` if one entry was updated, or `false` otherwise.
     */
    async updateOne(name, arg, obj){
        this.checkFile(name);
        return await fileM.updateOne(this.folder, name, arg, obj);
    }

    /**
     * Remove entries from the specified database based on search criteria.
     * @param {string} name - The name of the database.
     * @param {function|Object} arg - The search criteria. It can be a function or an object.
     * @returns {Promise<boolean>} A Promise that resolves to `true` if entries were removed, or `false` otherwise.
     */
    async remove(name, arg){
        this.checkFile(name);
        return await fileM.remove(this.folder, name, arg);
    }

    /**
     * Remove the first matching entry from the specified database based on search criteria.
     * @param {string} name - The name of the database.
     * @param {function|Object} arg - The search criteria. It can be a function or an object.
     * @returns {Promise<boolean>} A Promise that resolves to `true` if one entry was removed, or `false` otherwise.
     */
    async removeOne(name, arg){
        this.checkFile(name);
        return await fileM.removeOne(this.folder, name, arg);
    }

    /**
     * Removes a database collection from the file system.
     *
     * @param {string} name - The name of the collection to remove.
     * @return {void}
     */
    removeDb(name){
        fs.rmSync(this.folder + "/" + name, { recursive: true, force: true });
    }
}

/**
 * Get the last file in the specified directory.
 * @param {string} path - The directory path.
 * @returns {string} The name of the last file in the directory.
 */
function getLastFile(path){
    if(!fs.existsSync(path)) fs.mkdirSync(path, { recursive: true });
    let files = fs.readdirSync(path).filter(file => !/\.tmp$/.test(file));

    if(files.length == 0){
        fs.writeFileSync(path+"/1.db", "");
        return "1.db";
    }
    files = files.sort();
    const last = files[files.length-1];
    const info = path + "/" + last;
    if(fs.statSync(info).size > maxFileSize){
        const temName = last.replace(".db", "");
        const int = parseInt(temName) + 1;
        fs.writeFileSync(path + "/" + int + ".db", "");
        return int+".db";
    }else{
        return last;
    }
}

module.exports = dbActionC;