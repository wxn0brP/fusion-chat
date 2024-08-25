const DataBase = require("./database");
const ext = require("./ext");

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

module.exports = {
    init(){
        loadDatabases();
        ext.load();
    },

    loadDatabases
}