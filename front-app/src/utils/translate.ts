import hub from "../hub";
import cw from "../core";
import { Lang_Pkg } from "../types/utils";
import utils from "./utils";
hub("translate");

export const LangRef:
    { localesList: string[] } =
    { localesList: [] }

const LangPkg: Lang_Pkg = {};

export function langFunc(text: string, ...data: any[]): string {
    return text.replace(/\$/g, () => data.shift().toString() || '$')
}

export async function init_translate() {
    document.querySelectorAll("[translate]").forEach(ele => {
        if (ele.getAttribute("translate")) return;
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

export async function load_translate(lang: string = "en") {
    if (!LangRef.localesList.includes(lang)) return;
    localStorage.setItem("lang", lang);

    const LocalLangPkg: Lang_Pkg = {
        api: await importData<Lang_Pkg["api"]>(lang, "api"),
        media: await importData<Lang_Pkg["media"]>(lang, "media"),
        settings: await importData<Lang_Pkg["settings"]>(lang, "settings"),
        settings_realm: await importData<Lang_Pkg["settings_realm"]>(lang, "settings.realm"),
        settings_user: await importData<Lang_Pkg["settings_user"]>(lang, "settings.user"),
        socket: await importData<Lang_Pkg["socket"]>(lang, "socket"),
        ui: await importData<Lang_Pkg["ui"]>(lang, "ui"),
        uni: await importData<Lang_Pkg["uni"]>(lang, "uni"),
        common: await importData<Lang_Pkg["common"]>(lang, "common"),
    }

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

function getDataByKey(keyChain: string): string | null {
    const keys = keyChain.split(".");
    let data = utils.rmRef(LangPkg);

    for (const key of keys.slice(0, -1)) {
        data = data[key];
        if (!data) return null;
    }

    return data?.[keys[keys.length - 1]];
}

async function importData<T>(lang: string, pkg: string) {
    const data = await import(`../lang/${lang}/${pkg}.js`);
    return data.default as T;
}

export default LangPkg;
