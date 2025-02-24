import sourceMapSupport from "source-map-support";
sourceMapSupport.install();
global.lo = console.log;
await import("./start/confArg");
await import("./app");