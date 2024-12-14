await import("./setUp.js");
import { configDotenv } from "dotenv";
configDotenv();
await import("./env.js");

global.dir = "file://" + process.cwd() + "/";
await import("./global.js");
await import("./dataBase.js");
await import("./firebase.js");

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

const app = (await import("./express/index.js")).default;
import http from "http";
const server = http.createServer(app);
global.server = server;

await import("./socket/index.js");

lo("__________________"+(new Date()+"").split(" ").slice(1,5).join(" "));
server.listen(process.env.PORT, function(){
    if(process.env.status == "dev"){
        lo("Server started by developer mode");
        lo("http://localhost:"+process.env.PORT+"/app")
    }
});
import("./schedule/index.js");