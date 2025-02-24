import hub from "../hub.js";
import cw from "../core.js";
import utils from "./utils.js";
hub("translate");
export const LangRef = { localesList: [] };
const LangPkg = {};
export function langFunc(text, ...data) {
    return text.replace(/\\\$|(?<!\\)\$/g, (match) => {
        if (match === "\\$")
            return "$";
        return data.shift()?.toString() || "$";
    });
}
export async function init_translate() {
    document.querySelectorAll("[translate]").forEach(ele => {
        if (ele.getAttribute("translate"))
            return;
        ele.setAttribute("translate", ele.innerHTML.trim());
    });
    LangRef.localesList = cw.get("lang/list.txt").split("\n");
    LangRef.localesList.unshift("en");
    let lang = localStorage.getItem("lang");
    if (!lang) {
        const navigatorLang = navigator.language.split("-")[0];
        const langIndex = LangRef.localesList.indexOf(navigatorLang);
        lang = langIndex > -1 ? LangRef.localesList[langIndex] : "en";
    }
    await load_translate(lang);
}
export async function load_translate(lang = "en") {
    if (!LangRef.localesList.includes(lang))
        return;
    localStorage.setItem("lang", lang);
    const LocalLangPkg = {
        api: await importData(lang, "api"),
        media: await importData(lang, "media"),
        settings: await importData(lang, "settings"),
        settings_realm: await importData(lang, "settings.realm"),
        settings_user: await importData(lang, "settings.user"),
        socket: await importData(lang, "socket"),
        ui: await importData(lang, "ui"),
        uni: await importData(lang, "uni"),
        common: await importData(lang, "common"),
        InternalCode: await importData(lang, "code")
    };
    for (const key in LocalLangPkg) {
        LangPkg[key] = LocalLangPkg[key];
    }
    translateHTML();
}
export function translateHTML() {
    document.querySelectorAll("[translate]").forEach(ele => {
        const key = ele.getAttribute("translate");
        ele.innerHTML = getDataByKey(key);
    });
}
function getDataByKey(keyChain) {
    const keys = keyChain.split(".");
    let data = utils.rmRef(LangPkg);
    for (const key of keys.slice(0, -1)) {
        data = data[key];
        if (!data)
            return null;
    }
    return data?.[keys[keys.length - 1]];
}
async function importData(lang, pkg) {
    const dynamicImport = new Function("path", "return import(path);");
    const data = await dynamicImport(`./lang/${lang}/${pkg}.js`);
    return data.default;
}
export default LangPkg;
//# sourceMappingURL=translate.js.map