const args = process.argv.slice(2);

if(args.length == 0){
    console.log("No arguments");
    process.exit(1);
}

global.db = new (require("../../database"))("./serverDB");
const { addAccess, removeAccess } = require("../server/auth");

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