import DataBase from "./database.js";
import ext from "./ext.js";

global.selected = {
    db: null,
    dbName: null,
    table: null
}

global.databases = {};

function loadDatabases(){
    const dbNames = Object.keys(dbConfig);
    for(const dbName of dbNames){
        databases[dbName] = new DataBase(dbConfig[dbName]);
    }
}

export default {
    init(){
        loadDatabases();
        ext.load();
    },

    loadDatabases
}