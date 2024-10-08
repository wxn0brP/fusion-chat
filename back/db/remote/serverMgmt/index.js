let args = process.argv.slice(2);

if(args.length == 0){
    console.log("No arguments");
    process.exit(1);
}

import DataBase from "../../database.js";
import { addAccess, removeAccess } from "../server/auth.js";
global.db = new DataBase("./serverDB");

switch(args.shift()){
    case "add-access":
        addAccess().then(token => console.log(token));
    break;
    case "rm-access":
        if(args.length < 1){
            console.log("No user ID");
            process.exit(1);
        }
        removeAccess(args[0]).then((res) => console.log(res ? "Done" : "User not found"));
    break;
    case "add-db":
        if(args.length < 3){
            console.log("usage: add-db <type> <name> <folder> <opts>");
            console.log("*type: 'database' or 'graph'");
            console.log("*opts: JSON object");
            process.exit(1);
        }
        const type = args[0];
        const name = args[1];
        const folder = args[2];
        const opts = args[3] ? JSON.parse(args[3]) : {};
        
        const dbExists = await global.db.findOne("dbs", { name });
        if(dbExists){
            console.log("Database already exists");
            process.exit(1);
        }

        global.db.add("dbs", {
            type,
            name,
            folder,
            opts
        }, false).then(() => console.log("Done"));
    break;
    case "rm-db":
        if(args.length < 1){
            console.log("No database name");
            process.exit(1);
        }
        global.db.removeOne("dbs", { name: args[0] }).then((res) => console.log(res ? "Done" : "Database not found"));
    break;
    default:
        console.log("Invalid argument");
}