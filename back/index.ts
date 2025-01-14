await import("./setUp.js");
import { configDotenv } from "dotenv";
configDotenv();
await import("./env.js");
import sourceMapSupport from 'source-map-support'
sourceMapSupport.install()

global.dir = "file://" + process.cwd() + "/";
await import("./global.js");
await import("./dataBase.js");
await import("./firebase.js");
await import("./logs.js");

const app = (await import("./express/index.js")).default;
import http from "http";
const server = http.createServer(app);
global.server = server;

await import("./socket/index.js");

lo("__________________"+(new Date()+"").split(" ").slice(1,5).join(" "));
server.listen(parseInt(process.env.PORT), function(){
    if(process.env.NODE_ENV == "development"){
        lo("Server started by developer mode");
        lo("http://localhost:"+process.env.PORT+"/app")
    }
});
import("./schedule/index.js");