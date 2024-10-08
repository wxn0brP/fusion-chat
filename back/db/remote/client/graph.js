import got from "got";

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
     */
    constructor(remote){
        this.remote = remote;
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
        const res = await got.post(this.remote.url + "/graph/" + type, {
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

export default GraphRemote;