import got from "got";
import CollectionManager from "../../CollectionManager.js";

/**
 * Represents a database management class for performing CRUD operations.
 * Uses a remote database.
 * @class
 */
class DataBaseRemote{
    /**
     * Create a new database instance.
     * @constructor
     * @param {object} remote - The remote database object.
     * @param {string} remote.name - The name of the database.
     * @param {string} remote.folder - The folder path where the database files are stored.
     * @param {string} remote.auth - The authentication token.
     * @param {string} remote.url - The URL of the remote database.
     * @param {object} [options] - The options object.
     * @param {number} [options.cacheThreshold=3] - The cache threshold for database entries (default: 3).
     * @param {number} [options.cacheTTL=300000] - The time-to-live (TTL) for cached entries in milliseconds (default: 300,000 milliseconds or 5 minutes).
     */
    constructor(remote, options){
        this.remote = remote;
        this.options = options;
    }

    /**
     * Initialize the database.
     * @async
     * @function
     * @returns {Promise<boolean>} A Promise that resolves when the database is initialized.
     */
    async _init(){
        const res = await got.post(this.remote.url + "/register", {
            json: {
                name: this.remote.name,
                path: this.remote.path,
                type: "database",
                options: this.options
            },
            headers: {
                "Authorization": this.remote.auth
            },
            responseType: "json"
        });

        if(res.body.err) throw new Error(res.body.msg);
        return true;
    }

    /**
     * Make a request to the remote database.
     * @async
     * @function
     * @param {string} type - The type of the request.
     * @param {object} data - The data to send with the request.
     * @returns {Promise<*>} A Promise that resolves with the result of the request.
     * @throws {Error} If the request failed.
     */
    async _request(type, data){
        data.db = this.remote.name;
        const res = await got.post(this.remote.url + "/database/" + type, {
            json: data,
            headers: {
                "Authorization": this.remote.auth
            },
            responseType: "json"
        });

        if(res.body.err) throw new Error(res.body.msg);
        return res.body.result;
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
    async getDBs(){
        return await this._request("getDBs", {});
    }

    /**
     * Check and create the specified collection if it doesn't exist.
     *
     * @function
     * @param {string} collection - The collection to check.
     */
    async checkCollection(collection){
        return await this._request("checkCollection", { collection });
    }

    /**
     * Check if a collection exists.
     *
     * @function
     * @param {string} collection - The name of the collection.
     * @returns {boolean} True if the collection exists, false otherwise.
     */
    async issetCollection(collection){
        return await this._request("issetCollection", { collection });
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
        return await this._request("add", { collection, data, id_gen });
    }

    /**
     * Find data in a database.
     *
     * @async
     * @function
     * @param {string} collection - Name of the database collection.
     * @param {function|Object} search - The query. It can be an object or a function.
     * @param {Object} context - The context object (for functions).
     * @param {Object} options - The options for the search.
     * @param {number} options.max - The maximum number of entries to return. Default is -1, meaning no limit.
     * @param {boolean} options.reverse - Whether to reverse the order of returned entries. Default is false.
     * @returns {Promise<Array<Object>>} A Promise that resolves with the matching data.
     */
    async find(collection, search, context={}, options={}){
        if(typeof search === "function") search = search.toString();
        return await this._request("find", { collection, search, options, context });
    }

    /**
     * Find one data entry in a database.
     *
     * @async
     * @function
     * @param {string} collection - Name of the database collection.
     * @param {function|Object} search - The query. It can be an object or a function.
     * @param {Object} context - The context object (for functions).
     * @returns {Promise<Object|null>} A Promise that resolves with the first matching data entry.
     */
    async findOne(collection, search, context={}){
        if(typeof search === "function") search = search.toString();
        return await this._request("findOne", { collection, search, context });
    }

    /**
     * Update data in a database.
     *
     * @async
     * @function
     * @param {string} collection - Name of the database collection.
     * @param {function|Object} search - The query. It can be an object or a function.
     * @param {function|Object} arg - Update arguments.
     * @param {Object} context - The context object (for functions).
     * @returns {Promise<boolean>} A Promise that resolves when the data is updated.
     */
    async update(collection, search, arg, context={}){
        if(typeof search === "function") search = search.toString();
        if(typeof arg === "function") arg = arg.toString();
        return await this._request("update", { collection, search, arg, context });
    }

    /**
     * Update one data entry in a database.
     *
     * @async
     * @function
     * @param {string} collection - Name of the database collection.
     * @param {function|Object} search - The query. It can be an object or a function.
     * @param {function|Object} arg - The query.
     * @param {Object} context - The context object (for functions).
     * @returns {Promise<boolean>} A Promise that resolves when the data entry is updated.
     */
    async updateOne(collection, search, arg, context={}){
        if(typeof search === "function") search = search.toString();
        if(typeof arg === "function") arg = arg.toString();
        return await this._request("updateOne", { collection, search, arg, context });
    }

    /**
     * Remove data from a database.
     *
     * @async
     * @function
     * @param {string} collection - Name of the database collection.
     * @param {function|Object} search - The query. It can be an object or a function.
     * @param {Object} context - The context object (for functions).
     * @returns {Promise<boolean>} A Promise that resolves when the data is removed.
     */
    async remove(collection, search, context={}){
        if(typeof search === "function") search = search.toString();
        return await this._request("remove", { collection, search, context });
    }

    /**
     * Remove one data entry from a database.
     *
     * @async
     * @function
     * @param {string} collection - Name of the database collection.
     * @param {function|Object} search - The query. It can be an object or a function.
     * @param {Object} context - The context object (for functions).
     * @returns {Promise<boolean>} A Promise that resolves when the data entry is removed.
     */
    async removeOne(collection, search, context={}){
        if(typeof search === "function") search = search.toString();
        return await this._request("removeOne", { collection, search, context });
    }

    /**
     * Asynchronously updates one entry in a database or adds a new one if it doesn't exist.
     *
     * @param {string} collection - Name of the database collection.
     * @param {function|Object} search - The query. It can be an object or a function.
     * @param {function|Object} arg - The search criteria for the update.
     * @param {function|Object} add_arg - The arguments to be added to the new entry.
     * @param {Object} context - The context object (for functions).
     * @param {boolean} id_gen - Whether to generate an ID for the entry. Default is true.
     * @return {Promise<boolean>} A Promise that resolves to `true` if the entry was updated, or `false` if it was added.
     */
    async updateOneOrAdd(collection, search, arg, add_arg={}, context={}, id_gen=true){
        if(typeof search === "function") search = search.toString();
        if(typeof arg === "function") arg = arg.toString();
        if(typeof add_arg === "function") add_arg = add_arg.toString();
        return await this._request("updateOneOrAdd", { collection, search, arg, add_arg, id_gen, context });
    }

    /**
     * Removes a database collection from the file system.
     *
     * @param {string} collection - The name of the collection to remove.
     * @return {void}
     */
    removeDb(name){
        return this._request("removeDb", { name });
    }
}

export default DataBaseRemote;