global.lo = function(...data){
    let line = new Error().stack.split('\n')[2].trim();
    let path = line.slice(line.indexOf("(")).replace(global.dir, "").replace("(","").replace(")","");

    if(path.length < 2) path = line.replace(global.dir, "").replace("at ",""); // if path is 2 (callback):

    console.log("\x1b[36m"+path+":\x1b[0m", ...data);
}

global.delay = ms => new Promise(res => setTimeout(res, ms));

global.getTime = () => {
    return Math.floor(new Date().getTime() / 1000).toString(36);
}

global.fileConfig = await import("../config/file.js").then(module => module.default);
global.logsConfig = await import("../config/logs.js").then(module => module.default);