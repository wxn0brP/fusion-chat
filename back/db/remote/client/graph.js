const fetch = require("node-fetch");

/**
 * A class representing a graph database.
 * Uses a remote database.
 * @class
 */
class GraphRemote{
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
        const req = await fetch(this.remote.url + "/register", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json",
                "Authorization": this.remote.auth
            },
            body: JSON.stringify({
                name: this.remote.name,
                path: this.remote.path,
                type: "graph",
                options: this.options
            })
        });

        const res = await req.json();
        if(res.err) throw new Error(res.msg);
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
        const req = await fetch(this.remote.url + "/graph/" + type, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json",
                "Authorization": this.remote.auth
            },
            body: JSON.stringify(data)
        });

        const res = await req.json();
        if(res.err) throw new Error(res.msg);
        return res.result;
    }

    /**
     * Adds an edge between two nodes.
     * @async
     * @function
     * @param {string} collection - The name of the collection.
     * @param {string} nodeA - The first node.
     * @param {string} nodeB - The second node.
     * @returns {Promise<Object>} A promise that resolves with the added edge.
     */
    async add(collection, nodeA, nodeB){
        return await this._request("add", { collection, nodeA, nodeB });
    }

    /**
     * Removes an edge between two nodes.
     * @async
     * @function
     * @param {string} collection - The name of the collection.
     * @param {string} nodeA - The first node.
     * @param {string} nodeB - The second node.
     * @returns {Promise<boolean>} A promise that resolves when the edge is removed.
     */
    async remove(collection, nodeA, nodeB){
        return await this._request("remove", { collection, nodeA, nodeB });
    }

    /**
     * Finds all edges with either node equal to `node`.
     * @async
     * @function
     * @param {string} collection - The name of the collection.
     * @param {string} node - The node to search for.
     * @returns {Promise<Object[]>} A promise that resolves with the found edges.
     */
    async find(collection, node){
        return await this._request("find", { collection, node });
    }

    /**
     * Finds one edge with either node equal to `nodeA` and the other equal to `nodeB`.
     * @async
     * @function
     * @param {string} collection - The name of the collection.
     * @param {string} nodeA - The first node.
     * @param {string} nodeB - The second node.
     * @returns {Promise<Object|null>} A promise that resolves with the found edge or null if not found.
     */
    async findOne(collection, nodeA, nodeB){
        return await this._request("findOne", { collection, nodeA, nodeB });
    }
}

module.exports = GraphRemote;