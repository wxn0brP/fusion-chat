const db = require("./db");
const graph = require("./db/graph");

global.db = {
    data: new db("data/data"), //all types data
    mess: new db("data/mess"), //messages
    groupSettings: new db("data/groupSettings"), //groups/servers settings
    usersPerms: new db("data/perm"), // users permissions on servers
    logs: new db("data/logs"), //logs
    userDatas: new db("data/userDatas"), //user datas
    dataGraph: new graph("data/graph"), //all types data graph
}