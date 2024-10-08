import DataBase from "../../database.js";
import Graph from "../../graph.js";
global.db = new DataBase("./serverDB");
global.dataCenter = {};

const databases = await global.db.find("dbs", {});

for(const db of databases){
    if(db.type === "database"){
        global.dataCenter[db.name] = new DataBase(db.folder, db.opts || {});
    }else if(db.type === "graph"){
        global.dataCenter[db.name] = new Graph(db.folder, db.opts || {});
    }
}