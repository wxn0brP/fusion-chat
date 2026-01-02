import sourceMapSupport from "source-map-support";
import { configDotenv } from "dotenv";

await import("./setUp.js");
configDotenv({ quiet: true });
await import("./env.js");

sourceMapSupport.install();

global.dir = "file://" + process.cwd() + "/";
await import("./global.js");
await import("./dataBase.js");
await import("./firebase.js");
await import("./logs.js");
await import("./index.js");