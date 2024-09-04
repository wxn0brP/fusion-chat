const DataBase = require("./database");

/**
 * A class representing a graph database.
 * @class
 */
class Graph{
    /**
     * Initializes the graph database.
     * @constructor
     * @param {string} databaseFolder - The folder where the database is stored.
     */
    constructor(databaseFolder){
        this.db = new DataBase(databaseFolder);
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
        const sortedNodes = [nodeA, nodeB].sort();
        return await this.db.add(collection, {
            a: sortedNodes[0],
            b: sortedNodes[1]
        }, false);
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
        const sortedNodes = [nodeA, nodeB].sort();
        const query = { a: sortedNodes[0], b: sortedNodes[1] };
        return await this.db.removeOne(collection, query);
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
        const edges = [];
        const edgesByANode = await this.db.find(collection, { a: node });
        const edgesByBNode = await this.db.find(collection, { b: node });

        if(edgesByANode) edges.push(...edgesByANode);
        if(edgesByBNode) edges.push(...edgesByBNode);

        return edges;
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
        const edgeAB = await this.db.findOne(collection, { a: nodeA, b: nodeB });
        if(edgeAB) return edgeAB;

        const edgeBA = await this.db.findOne(collection, { a: nodeB, b: nodeA });
        if(edgeBA) return edgeBA;

        return null;
    }
}

module.exports = Graph;