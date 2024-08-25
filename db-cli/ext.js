const fs = require('fs');

const extensions = [];

function loadExtension(file){
    const ext = require(__dirname + "/ext/" + file);
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

module.exports = {
    process,
    load(){
        fs.readdirSync(__dirname + "/ext").forEach(file => {
            if(file.endsWith(".js")) loadExtension(file);
        });
    }
};