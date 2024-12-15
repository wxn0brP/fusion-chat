import fs from "fs";

function dir(path){
    if(!fs.existsSync(path)) fs.mkdirSync(path);
}
function file(path, value="", prefix="config/"){
    if(!fs.existsSync(prefix+path)) fs.writeFileSync(prefix+path, value);
}
function preFile(path, pre, prefix="config/"){
    if(!fs.existsSync(prefix+path+".js")) fs.copyFileSync("back/config-base/"+pre+".js", prefix+path+".js");
}

dir("data");
dir("config");
dir("userFiles");
dir("userFiles/users");
dir("userFiles/profiles");
dir("userFiles/realms");
file("banedIP.json", "[]");
file("mailConfig.json", "{}");
preFile("file", "file");
preFile("database", "database");
preFile("logs", "logs");