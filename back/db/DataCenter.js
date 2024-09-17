const DataBase = require("./database");

/**
 * Class representing a DataCenter, which manages multiple database instances.
 * @class
 */
class DataCenter{
    /**
     * Create a new DataCenter instance.
     * @constructor
     */
    constructor(){
        this.databases = {};
    }

    /**
     * Add a new database instance to the DataCenter.
     * @param {string} name - The name of the database.
     * @param {DataBase} dataBase - The database instance.
     */
    addDataBase(name, dataBase){
        if(this.databases[name])
            throw new Error(`Database with the name "${name}" already exists.`);
        
        this.databases[name] = dataBase;
    }

    /**
     * Get a database instance by name.
     * @param {string} name - The name of the database.
     * @returns {DataBase} The database instance.
     */
    getDataBase(name){
        if(!this.databases[name])
            throw new Error(`Database with the name "${name}" does not exist.`);
        
        return this.databases[name];
    }

    /**
     * Remove a database instance from the DataCenter.
     * @param {string} name - The name of the database.
     */
    removeDataBase(name){
        if(!this.databases[name])
            throw new Error(`Database with the name "${name}" does not exist.`);
        
        delete this.databases[name];
    }

    /**
     * List all database names in the DataCenter.
     * @returns {string[]} An array of database names.
     */
    listDataBases(){
        return Object.keys(this.databases);
    }
}

module.exports = DataCenter;