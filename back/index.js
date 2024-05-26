require("./setUp");
require("dotenv").config();
global.dir = __dirname + "/";
require("./global");
require("./dataBase");
require("./firebase");

process.on("uncaughtException", (e) => {
    try{
        console.error("Uncaught Exception: ", e);
        global.db.logs.add("uncaughtException", {
            error: e.message,
            stackTrace: e.stack
        });
    }catch(e){
        console.error("Critical error: ", e);
    }
});
process.on('unhandledRejection', (reason, promise) => {
    try{
        console.error("Unhandled Rejection: ", reason);
        global.db.logs.add("unhandledRejection", {
            reason: reason,
            promise: promise
        })
    }catch(e){
        console.error("Critical error: ", e);
    }
});

const app = require("./express");
const server = require("http").createServer(app);
global.server = server;

require("./socket");

lo("__________________"+(new Date()+"").split(" ").slice(1,5).join(" "));
server.listen(process.env.PORT, function(){
    if(process.env.status == "dev"){
        lo("http://localhost:"+process.env.PORT+"/app")
    }
});