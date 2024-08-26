const fs = require("fs");
const path = require("path");

const extensions = [];
const cfgPath = path.join(__dirname, "cfg/ext.json");
if(!fs.existsSync(cfgPath)) fs.writeFileSync(cfgPath, "{}", "utf8");

const extPath = path.join(__dirname, "ext");
if(!fs.existsSync(extPath)){
    fs.mkdirSync(extPath);
}

function loadExtension(file){
    const ext = require(path.join(__dirname, "ext", file));
    const extRequire = ext.req;
    for(const req of extRequire){
        if(!global.databases[req]) return;
    }
    delete ext.req;

    extensions.push(ext);
}


async function process(type, dbName, tableName, data){
    let exts = extensions.filter(ext => ext.type === type);
    exts = exts.filter(ext => ext.onDb === dbName);
    exts = exts.filter(ext => {
        if(ext.onCol) return ext.onCol === tableName;
        return true;
    });

    for(const ext of exts){
        const tmp = await ext.run(data);
        if(tmp) data = tmp;
    }

    return data;
}

function updateConfig(files, cfg=[]){
    files.forEach(file => {
        if(!(file in cfg))
            cfg[file] = { in: true, no_in: true };
    });

    Object.keys(cfg).forEach(file => {
        if(!files.includes(file))
            delete cfg[file];
    });

    return cfg;
}

function load(){
    const exts = fs.readdirSync(extPath).filter(file => file.endsWith(".js")).map(file => file.replace(".js", ""));

    let cfg = JSON.parse(fs.readFileSync(cfgPath, "utf8") || "{}");
    cfg = updateConfig(exts, cfg);
    fs.writeFileSync(cfgPath, JSON.stringify(cfg, null, 2), "utf8");

    const mode = global.runMode;
    let onExts = [];
    if(mode === "interactive"){
        onExts = Object.keys(cfg).filter(ext => cfg[ext].in);
    }else
    if(mode === "no interactive"){
        onExts = Object.keys(cfg).filter(ext => cfg[ext].no_in);
    }

    lo("Extensions:", onExts);
    
    for(const ext of onExts){
        loadExtension(ext);
    }
}

module.exports = {
    process,
    load
};