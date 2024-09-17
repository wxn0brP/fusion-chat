class CollectionManager{
    constructor(db, collection){
        this.db = db;
        this.collection = collection;
    }

    /**
     * Add data to a database.
     *
     * @async
     * @function
     * @param {Object} data - The data to add.
     * @param {boolean} id_gen - Whether to generate an ID for the entry. Default is true.
     * @returns {Promise<Object>} A Promise that resolves with the added data.
     */
    async add(data, id_gen=true){
        return await this.db.add(this.collection, data, id_gen);
    }

    /**
     * Find data in a database.
     *
     * @async
     * @function
     * @param {function|Object} search - The query. It can be an object or a function.
     * @param {Object} options - The options for the search.
     * @param {number} options.max - The maximum number of entries to return. Default is -1, meaning no limit.
     * @param {boolean} options.reverse - Whether to reverse the order of returned entries. Default is false.
     * @returns {Promise<Array<Object>>} A Promise that resolves with the matching data.
     */
    async find(search, options={}){
        return await this.db.find(this.collection, search, options);
    }

    /**
     * Find one data entry in a database.
     *
     * @async
     * @function
     * @param {function|Object} search - The query. It can be an object or a function.
     * @returns {Promise<Object|null>} A Promise that resolves with the first matching data entry.
     */
    async findOne(search){
        return await this.db.findOne(this.collection, search);
    }

    /**
     * Update data in a database.
     *
     * @async
     * @function
     * @param {function|Object} search - The query. It can be an object or a function.
     * @param {function|Object} arg - Update arguments.
     * @returns {Promise<boolean>} A Promise that resolves when the data is updated.
     */
    async update(search, arg){
        return await this.db.update(this.collection, search, arg);
    }

    /**
     * Update one data entry in a database.
     *
     * @async
     * @function
     * @param {function|Object} search - The query. It can be an object or a function.
     * @param {function|Object} arg - The query.
     * @returns {Promise<boolean>} A Promise that resolves when the data entry is updated.
     */
    async updateOne(search, arg){
        return await this.db.updateOne(this.collection, search, arg);
    }

    /**
     * Remove data from a database.
     *
     * @async
     * @function
     * @param {function|Object} search - The query. It can be an object or a function.
     * @returns {Promise<boolean>} A Promise that resolves when the data is removed.
     */

    async remove(search){
        return await this.db.remove(this.collection, search);
    }

    /**
     * Remove one data entry from a database.
     *
     * @async
     * @function
     * @param {function|Object} search - The query. It can be an object or a function.
     * @returns {Promise<boolean>} A Promise that resolves when the data entry is removed.
     */
    async removeOne(search){
        return await this.db.removeOne(this.collection, search);
    }

    /**
     * Asynchronously updates one entry in a database or adds a new one if it doesn't exist.
     *
     * @param {function|Object} search - The query. It can be an object or a function.
     * @param {function|Object} arg - The search criteria for the update.
     * @param {function|Object} add_arg - The arguments to be added to the new entry.
     * @param {boolean} id_gen - Whether to generate an ID for the entry. Default is true.
     * @return {Promise<boolean>} A Promise that resolves to `true` if the entry was updated, or `false` if it was added.
     */
    async updateOneOrAdd(search, arg, add_arg={}, id_gen=true){
        return await this.db.updateOneOrAdd(this.collection, search, arg, add_arg, id_gen);
    }
}

module.exports = CollectionManager;
