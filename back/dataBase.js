const config = require("../config/database");
const local = {
    db: require("./db"),
    graph: require("./db/graph")
}
const remote = require("./db/remote/client");

global.db = {};
const databases = [
    { name: "data", type: "database" },             //all types data
    { name: "mess", type: "database" },             //messages
    { name: "groupSettings", type: "database" },    //groups/servers settings
    { name: "usersPerms", type: "database" },       // users permissions on servers
    { name: "logs", type: "database" },             //logs
    { name: "userDatas", type: "database" },        //user datas
    { name: "dataGraph", type: "graph" },           //all types data graph
    { name: "groupData", type: "database" },        //group data
];

function getRemoteConfig(name, path){
    const cnf = {
        name,
        path
    }
    const custom = config[name];
    if(custom.url && custom.auth){
        cnf.url = custom.url;
        cnf.auth = custom.auth;
    }else{
        cnf.url = config.remoteDefault.url;
        cnf.auth = config.remoteDefault.auth;
    }
    return cnf;
}

async function initDataBase(name){
    const cfg = config[name];
    if(cfg.type === "local"){
        return new local.db(cfg.path);
    }else if(cfg.type === "remote"){
        const remoteCfg = getRemoteConfig(name, cfg.path);
        return await remote.DataBase(remoteCfg);
    }else{
        throw new Error("Unknown database type " + cfg.name);
    }
}

async function initGraph(name){
    const cfg = config[name];
    if(cfg.type === "local"){
        return new local.graph(cfg.path);
    }else if(cfg.type === "remote"){
        const remoteCfg = getRemoteConfig(name, cfg.path);
        return await remote.Graph(remoteCfg);
    }else{
        throw new Error("Unknown database type " + cfg.name);
    }
}

/**
 * Initializes the database.
 * If the database type is set to "local", it will create local databases.
 * If the database type is set to "remote", it will connect to a remote database.
 * @async
 * @function
 * @returns {Promise<void>} A Promise that resolves when the database is initialized.
 */
module.exports = async () => {
    for(const database of databases){
        if(database.type === "database"){
            global.db[database.name] = await initDataBase(database.name);
        }else if(database.type === "graph"){
            global.db[database.name] = await initGraph(database.name);
        }
    }
}