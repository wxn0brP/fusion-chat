var __defProp = Object.defineProperty;
var __returnValue = (v) => v;
function __exportSetter(name, newValue) {
  this[name] = __returnValue.bind(null, newValue);
}
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, {
      get: all[name],
      enumerable: true,
      configurable: true,
      set: __exportSetter.bind(all, name)
    });
};
var __esm = (fn, res) => () => (fn && (res = fn(fn = 0)), res);
var __promiseAll = (args) => Promise.all(args);

// back/setUp.ts
var exports_setUp = {};
import fs from "fs";
function dir(path) {
  if (!fs.existsSync(path))
    fs.mkdirSync(path);
}
function file(path, value = "", prefix = "config/") {
  if (!fs.existsSync(prefix + path))
    fs.writeFileSync(prefix + path, value);
}
function preFile(path, pre = path, prefix = "config/") {
  if (!fs.existsSync(prefix + path + ".js"))
    fs.copyFileSync("dist-back/config-base/" + pre + ".js", prefix + path + ".js");
}
var init_setUp = __esm(() => {
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
});
init_setUp();

//# debugId=A922A7D9C904F8B464756E2164756E21
