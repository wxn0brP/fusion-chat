const dbActionC = require("./action");
const executorC = require("./executor");

/**
 * Represents a database management class for performing CRUD operations.
 * @class
 */
class DataBase{
    /**
     * Create a new database instance.
     * @constructor
     * @param {string} folder - The folder path where the database files are stored.
     * @param {number} [cacheThreshold=3] - The cache threshold for database entries (default: 3).
     * @param {number} [ttl=300000] - The time-to-live (TTL) for cached entries in milliseconds (default: 300,000 milliseconds or 5 minutes).
     */
    constructor(folder, cacheThreshold=3, ttl=300_000){
        this.dbAction = new dbActionC(folder, cacheThreshold, ttl);
        this.executor = new executorC();
    }

    /**
     * Get the names of all available databases.
     *
     * @function
     * @returns {string[]} An array of database names.
     */
    getDBs(){
        return this.dbAction.getDBs();
    }

    /**
     * Check if a file exists within the database folder.
     *
     * @function
     * @param {string} dir - The file or directory path to check.
     */
    checkFile(dir){
        this.dbAction.checkFile(dir);
    }

    /**
     * Add data to a database.
     *
     * @async
     * @function
     * @param {string} name - The name of the database.
     * @param {Object} data - The data to add.
     * @param {boolean} id_gen - Whether to generate an ID for the entry. Default is true.
     * @returns {Promise} A Promise that resolves when the data is added.
     */
    async add(name, data, id_gen=true){
        return await this.executor.addOp(this.dbAction.add.bind(this.dbAction), name, data, id_gen);
    }

    /**
     * Find data in a database.
     *
     * @async
     * @function
     * @param {string} name - The name of the database.
     * @param {Object} search - The query.
     * @param {Object} options - The options for the search.
     * @param {number} options.max - The maximum number of entries to return. Default is -1, meaning no limit.
     * @param {boolean} options.reverse - Whether to reverse the order of returned entries. Default is false.
     * @returns {Promise} A Promise that resolves with the matching data.
     */
    async find(name, search, options={}){
        return await this.executor.addOp(this.dbAction.find.bind(this.dbAction), name, search, options);
    }

    /**
     * Find one data entry in a database.
     *
     * @async
     * @function
     * @param {string} name - The name of the database.
     * @param {Object} search - The query.
     * @returns {Promise} A Promise that resolves with the first matching data entry.
     */
    async findOne(name, search){
        return await this.executor.addOp(this.dbAction.findOne.bind(this.dbAction), name, search);
    }

    /**
     * Update data in a database.
     *
     * @async
     * @function
     * @param {string} name - The name of the database.
     * @param {Object} search - The query.
     * @param {Object} arg - Update arguments.
     * @returns {Promise} A Promise that resolves when the data is updated.
     */
    async update(name, search, arg){
        return await this.executor.addOp(this.dbAction.update.bind(this.dbAction), name, search, arg);
    }

    /**
     * Update one data entry in a database.
     *
     * @async
     * @function
     * @param {string} name - The name of the database.
     * @param {Object} search - The query.
     * @param {Object} arg - The query.
     * @returns {Promise} A Promise that resolves when the data entry is updated.
     */
    async updateOne(name, search, arg){
        return await this.executor.addOp(this.dbAction.updateOne.bind(this.dbAction), name, search, arg);
    }

    /**
     * Remove data from a database.
     *
     * @async
     * @function
     * @param {string} name - The name of the database.
     * @param {Object} search - The query.
     * @returns {Promise} A Promise that resolves when the data is removed.
     */
    async remove(name, search){
        return await this.executor.addOp(this.dbAction.remove.bind(this.dbAction), name, search);
    }

    /**
     * Remove one data entry from a database.
     *
     * @async
     * @function
     * @param {string} name - The name of the database.
     * @param {Object} search - The query.
     * @returns {Promise} A Promise that resolves when the data entry is removed.
     */
    async removeOne(name, search){
        return await this.executor.addOp(this.dbAction.removeOne.bind(this.dbAction), name, search);
    }

    
    /**
     * Asynchronously updates one entry in a database or adds a new one if it doesn't exist.
     *
     * @param {string} name - The name of the database.
     * @param {Object} search - The search criteria for the update.
     * @param {Object} arg - The search criteria for the update.
     * @param {Object} add_arg - The arguments to be added to the new entry.
     * @return {Promise} A Promise that resolves when the update is complete.
     */
    async updateOneOrAdd(name, search, arg, add_arg={}){
        const res = await this.updateOne(name, search, arg);
        if(!res) await this.add(name, Object.assign(search, arg, add_arg));
    }

    /**
     * Removes a database collection from the file system.
     *
     * @param {string} name - The name of the collection to remove.
     * @return {void}
     */
    removeDb(name){
         this.dbAction.removeDb(name);
    }
}

module.exports = DataBase;