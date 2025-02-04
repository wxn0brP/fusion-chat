import fs from "fs";

function dir(path: string){
    if(!fs.existsSync(path)) fs.mkdirSync(path);
}
function file(path: string, value: string="", prefix: string="config/"){
    if(!fs.existsSync(prefix+path)) fs.writeFileSync(prefix+path, value);
}
function preFile(path: string, pre: string=path, prefix: string="config/"){
    if(!fs.existsSync(prefix+path+".js")) fs.copyFileSync("dist-back/config-base/"+pre+".js", prefix+path+".js");
}

dir("data");
dir("config");
dir("userFiles");
dir("userFiles/users");
dir("userFiles/profiles");
dir("userFiles/realms");
file("bannedIP.json", "[]");
file("mailConfig.json", "{}");
preFile("file");
preFile("database");
preFile("logs");
preFile("cache");