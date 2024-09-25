import databaseC from "./database.js";
import graphC from "./graph.js";

export async function DataBase(remote, options){
    const db = new databaseC(remote, options);
    await db._init();
    return db;
}

export async function Graph(remote, options){
    const graph = new graphC(remote, options);
    await graph._init();
    return graph;
}