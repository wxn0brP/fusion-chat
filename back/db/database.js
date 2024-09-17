const dbActionC = require("./action");
const executorC = require("./executor");
const CollectionManager = require("./CollectionManager");

/**
 * Represents a database management class for performing CRUD operations.
 * @class
 */
class DataBase{
    /**
     * Create a new database instance.
     * @constructor
     * @param {string} folder - The folder path where the database files are stored.
     * @param {object} [options] - The options object.
     * @param {number} [options.cacheThreshold=3] - The cache threshold for database entries (default: 3).
     * @param {number} [options.cacheTTL=300000] - The time-to-live (TTL) for cached entries in milliseconds (default: 300,000 milliseconds or 5 minutes).
     */
    constructor(folder, options={}){
        options = {
            cacheThreshold: 3,
            cacheTTL: 300_000,
            ...options
        }
        this.dbAction = new dbActionC(folder, options);
        this.executor = new executorC();
    }

    /**
     * Create a new instance of a CollectionManager class.
     * @function
     * @param {string} collection - The name of the collection.
     * @returns {CollectionManager} A new instance of CollectionManager.
     */
    c(collection){
        return new CollectionManager(this, collection);
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
     * Check and create the specified collection if it doesn't exist.
     *
     * @function
     * @param {string} collection - The collection to check.
     */
    checkCollection(collection){
        this.dbAction.checkCollection(collection);
    }

    /**
     * Add data to a database.
     *
     * @async
     * @function
     * @param {string} collection - The name of the collection.
     * @param {Object} data - The data to add.
     * @param {boolean} id_gen - Whether to generate an ID for the entry. Default is true.
     * @returns {Promise<Object>} A Promise that resolves with the added data.
     */
    async add(collection, data, id_gen=true){
        return await this.executor.addOp(this.dbAction.add.bind(this.dbAction), collection, data, id_gen);
    }

    /**
     * Find data in a database.
     *
     * @async
     * @function
     * @param {string} collection - Name of the database collection.
     * @param {function|Object} search - The query. It can be an object or a function.
     * @param {Object} options - The options for the search.
     * @param {number} options.max - The maximum number of entries to return. Default is -1, meaning no limit.
     * @param {boolean} options.reverse - Whether to reverse the order of returned entries. Default is false.
     * @returns {Promise<Array<Object>>} A Promise that resolves with the matching data.
     */
    async find(collection, search, options={}){
        return await this.executor.addOp(this.dbAction.find.bind(this.dbAction), collection, search, options);
    }

    /**
     * Find one data entry in a database.
     *
     * @async
     * @function
     * @param {string} collection - Name of the database collection.
     * @param {function|Object} search - The query. It can be an object or a function.
     * @returns {Promise<Object|null>} A Promise that resolves with the first matching data entry.
     */
    async findOne(collection, search){
        return await this.executor.addOp(this.dbAction.findOne.bind(this.dbAction), collection, search);
    }

    /**
     * Update data in a database.
     *
     * @async
     * @function
     * @param {string} collection - Name of the database collection.
     * @param {function|Object} search - The query. It can be an object or a function.
     * @param {function|Object} arg - Update arguments.
     * @returns {Promise<boolean>} A Promise that resolves when the data is updated.
     */
    async update(collection, search, arg){
        return await this.executor.addOp(this.dbAction.update.bind(this.dbAction), collection, search, arg);
    }

    /**
     * Update one data entry in a database.
     *
     * @async
     * @function
     * @param {string} collection - Name of the database collection.
     * @param {function|Object} search - The query. It can be an object or a function.
     * @param {function|Object} arg - The query.
     * @returns {Promise<boolean>} A Promise that resolves when the data entry is updated.
     */
    async updateOne(collection, search, arg){
        return await this.executor.addOp(this.dbAction.updateOne.bind(this.dbAction), collection, search, arg);
    }

    /**
     * Remove data from a database.
     *
     * @async
     * @function
     * @param {string} collection - Name of the database collection.
     * @param {function|Object} search - The query. It can be an object or a function.
     * @returns {Promise<boolean>} A Promise that resolves when the data is removed.
     */
    async remove(collection, search){
        return await this.executor.addOp(this.dbAction.remove.bind(this.dbAction), collection, search);
    }

    /**
     * Remove one data entry from a database.
     *
     * @async
     * @function
     * @param {string} collection - Name of the database collection.
     * @param {function|Object} search - The query. It can be an object or a function.
     * @returns {Promise<boolean>} A Promise that resolves when the data entry is removed.
     */
    async removeOne(collection, search){
        return await this.executor.addOp(this.dbAction.removeOne.bind(this.dbAction), collection, search);
    }

    /**
     * Asynchronously updates one entry in a database or adds a new one if it doesn't exist.
     *
     * @param {string} collection - Name of the database collection.
     * @param {function|Object} search - The query. It can be an object or a function.
     * @param {function|Object} arg - The search criteria for the update.
     * @param {function|Object} add_arg - The arguments to be added to the new entry.
     * @return {Promise<boolean>} A Promise that resolves to `true` if the entry was updated, or `false` if it was added.
     */
    async updateOneOrAdd(collection, search, arg, add_arg={}){
        const res = await this.updateOne(collection, search, arg);
        if(!res) await this.add(collection, Object.assign(search, arg, add_arg));
        return res;
    }

    /**
     * Removes a database collection from the file system.
     *
     * @param {string} collection - The name of the collection to remove.
     * @return {void}
     */
    removeDb(collection){
         this.dbAction.removeDb(collection);
    }
}

module.exports = DataBase;