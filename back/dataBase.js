import config from "../config/database.js";
import { DataBase, Graph, DataBaseRemote, GraphRemote } from "@wxn0brp/db";

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
    { name: "botData", type: "database" },          //bot data
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
        return new DataBase(cfg.path);
    }else if(cfg.type === "remote"){
        const remoteCfg = getRemoteConfig(name, cfg.path);
        return await DataBaseRemote(remoteCfg);
    }else{
        throw new Error("Unknown database type " + cfg.name);
    }
}

async function initGraph(name){
    const cfg = config[name];
    if(cfg.type === "local"){
        return new Graph(cfg.path);
    }else if(cfg.type === "remote"){
        const remoteCfg = getRemoteConfig(name, cfg.path);
        return await GraphRemote(remoteCfg);
    }else{
        throw new Error("Unknown database type " + cfg.name);
    }
}

for(const database of databases){
    if(database.type === "database"){
        global.db[database.name] = await initDataBase(database.name);
    }else if(database.type === "graph"){
        global.db[database.name] = await initGraph(database.name);
    }
}