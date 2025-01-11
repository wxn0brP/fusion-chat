import config from "../config/database.js";
import { DataBase, Graph, DataBaseRemote, GraphRemote } from "@wxn0brp/db";

/** @type {import("./types/dataBase.js").dbs} */
const db = {};

const databases = [
    { name: "data", type: "database" },             //all types data
    { name: "dataGraph", type: "graph" },           //all types data graph
    { name: "system", type: "database" },           //system config and data
    { name: "logs", type: "database" },             //logs

    { name: "mess", type: "database" },             //messages
    { name: "userData", type: "database" },         //user data
    { name: "botData", type: "database" },          //bot data

    { name: "realmConf", type: "database" },        //realm settings
    { name: "realmRoles", type: "database" },       //realm roles
    { name: "realmUser", type: "database" },        //realm users
    { name: "realmData", type: "database" },        //realm all types data
    { name: "realmDataGraph", type: "graph" },      //realm all types data graph
];

function getRemoteConfig(name, path){
    const cnf = {
        name,
        path,
        url: null,
        auth: null
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
        return new DataBaseRemote(remoteCfg);
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
        return new GraphRemote(remoteCfg);
    }else{
        throw new Error("Unknown database type " + cfg.name);
    }
}

for(const database of databases){
    if(database.type === "database"){
        db[database.name] = await initDataBase(database.name);
    }else if(database.type === "graph"){
        db[database.name] = await initGraph(database.name);
    }
}

export default db;