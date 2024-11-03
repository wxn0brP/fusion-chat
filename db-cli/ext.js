import { existsSync, writeFileSync, mkdirSync, readdirSync, readFileSync } from "fs";
import { join } from "path";

const extensions = [];
const cfgPath = join(__dirname, "cfg/ext.json");
if(!existsSync(cfgPath)) writeFileSync(cfgPath, "{}", "utf8");

const extPath = join(__dirname, "ext");
if(!existsSync(extPath)){
    mkdirSync(extPath);
}

async function loadExtension(file){
    const ext = await import(join(__dirname, 'ext', file+".js"));
    const extRequire = ext.req;
    for(const req of extRequire){
        if(!global.databases[req]) return;
    }

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

async function load(){
    const exts = readdirSync(extPath).filter(file => file.endsWith(".js")).map(file => file.replace(".js", ""));

    let cfg = JSON.parse(readFileSync(cfgPath, "utf8") || "{}");
    cfg = updateConfig(exts, cfg);
    writeFileSync(cfgPath, JSON.stringify(cfg, null, 2), "utf8");

    const mode = global.runMode;
    let onExts = [];
    if(mode === "interactive"){
        onExts = Object.keys(cfg).filter(ext => cfg[ext].in);
    }else
    if(mode === "no interactive"){
        onExts = Object.keys(cfg).filter(ext => cfg[ext].no_in);
    }

    if(mode === "interactive") lo("Extensions:", onExts);
    
    for(const ext of onExts){
        await loadExtension(ext);
    }
}

export default {
    process,
    load
};