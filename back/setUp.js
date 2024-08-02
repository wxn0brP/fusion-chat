const fs = require("fs");

function dir(path){
    if(!fs.existsSync(path)) fs.mkdirSync(path);
}
function file(path, value="", prefix="config/"){
    if(!fs.existsSync(prefix+path)) fs.writeFileSync(prefix+path, value);
}
function preFile(path, pre, prefix="config/"){
    if(!fs.existsSync(prefix+path)) fs.copyFileSync("back/config-base/"+pre+".js", prefix+path);
}

dir("data");
dir("config");
dir("userFiles");
dir("userFiles/profiles");
file("banedIP.json", "[]");
file("mailConfig.json", "{}");
preFile("file.js", "file");