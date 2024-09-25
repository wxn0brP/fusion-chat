const args = process.argv.slice(2);

if(args.length == 0){
    console.log("No arguments");
    process.exit(1);
}

import DataBase from "../../database.js";
import { addAccess, removeAccess } from "../server/auth.js";
global.db = new DataBase("./serverDB");

switch(args[0]){
    case "add":
        addAccess().then(token => console.log(token));
        break;
    case "rm":
        if(args.length < 2){
            console.log("No user ID");
            process.exit(1);
        }
        removeAccess(args[1]).then(() => console.log("Done"));
        break;
    default:
        console.log("Invalid argument");
}