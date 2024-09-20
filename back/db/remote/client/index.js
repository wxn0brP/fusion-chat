const databaseC = require("./database");
const graphC = require("./graph");

async function DataBase(remote, options){
    const db = new databaseC(remote, options);
    await db._init();
    return db;
}

async function Graph(remote, options){
    const graph = new graphC(remote, options);
    await graph._init();
    return graph;
}

module.exports = {
    DataBase,
    Graph
}