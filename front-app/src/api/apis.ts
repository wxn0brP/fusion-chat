import debugFunc, { LogLevel } from "../core/debug";
import uiFunc from "../ui/helpers/uiFunc";
import vars from "../var/var";
import { mglVar } from "../var/mgl";
import Id from "../types/Id";
import LangPkg from "../utils/translate";
import { Core_Api__GetInServer__Response } from "../types/core/api";
import changeCodeToString from "../utils/code";
import apiVars from "../var/api";

const apis = {
    www: {
        async changeUserID(id: Id): Promise<string> {
            const chat = vars.chat.to;
            const temp = apiVars.temp.user;

            if (chat.startsWith("$") || chat == "main") { // if dm or main
                if (temp.main[id]) return temp.main[id];
                const data = (await apis.www.getInServer("/api/id/u?id=" + id)).name;
                if (!data) return "Unknown";
                temp.main[id] = data;
                return data;
            }

            // if realm
            if (!temp[chat]) temp[chat] = {};

            const issetData = temp[chat][id];
            if (issetData) return issetData;
            if (issetData == 0) return temp.main[id];

            if (id.startsWith("%")) { // if webhook
                const data = (await apis.www.getInServer("/api/id/wh?id=" + id.replace("%", "") + "&chat=" + chat)).name + " (APP)";
                if (!data) return "Unknown";
                temp[chat][id] = data;
                return data;
            } else if (id.startsWith("^")) { // if bot
                const data = (await apis.www.getInServer("/api/id/bot?id=" + id.replace("^", "") + "&chat=" + chat)).name + " (BOT)";
                if (!data) return "Unknown";
                temp[chat][id] = data;
                return data;
            } else if (id.startsWith("(")) { // if event chnl
                const data = (await apis.www.getInServer("/api/id/event?id=" + id.replace("(", ""))).name + " (EVENT)";
                if (!data) return "Unknown";
                temp[chat][id] = data;
                return data;
            }
            else { // if user in chat
                interface Data extends Core_Api__GetInServer__Response {
                    c: -1 | 0 | 1
                }
                const data = await apis.www.getInServer<Data>("/api/id/u?id=" + id + "&chat=" + chat);
                if (!data) return "Unknown";
                if (data.c == 1) {
                    temp[chat][id] = data.name;
                    return data.name;
                }
                else if (data.c == 0) {
                    temp[chat][id] = 0;
                    if (temp.main[id]) return temp.main[id];
                    const name = (await apis.www.getInServer("/api/id/u?id=" + id)).name;
                    if (!name) return "Unknown";
                    temp.main[id] = name;
                    return name;
                } else {
                    temp.main[id] = data.name;
                    return data.name;
                }
            }
        },

        async changeChat(id: Id): Promise<string> {
            if (apiVars.temp.realm[id]) return apiVars.temp.realm[id];
            const data = (await apis.www.getInServer("/api/id/chat?chat=" + id)).name;
            apiVars.temp.realm[id] = data;
            return data;
        },

        async getInServer<T = Core_Api__GetInServer__Response>(url: string): Promise<T> {
            const data = await fetch(url).then(res => res.json());
            if (data.err) {
                uiFunc.uiMsgT(LangPkg.api.error_fetch, ["."]);
                uiFunc.uiMsgT(LangPkg.api.error, changeCodeToString(data.c));
                debugFunc.msg(LogLevel.ERROR, data);
                return null;
            }
            return data;
        }
    },
    app: {
        async init(): Promise<void> {
            const dev = {
                isElectron: navigator.userAgent.toLowerCase().includes("electron"),
                isInIframe: window.self !== window.top,
                // @ts-ignore
                isReactNative: !!window.ReactNativeWebView,
            }

            let path = "web";
            if (dev.isElectron) path = "ele";
            else if (dev.isReactNative) path = "rn";
            else if (dev.isInIframe) path = "if";
            this.apiType = path;

            const devices = {
                web: () => import("./devices/web.js"),
                ele: () => import("./devices/ele.js"),
                rn: () => import("./devices/rn.js"),
                if: () => import("./devices/if.js"),
            };

            apis.api = await devices[path]();
            debugFunc.msg(LogLevel.INFO, "load api: " + path);
        },
        apiType: "",
    },
    api: {
        send(data: any): void {
            debugFunc.msg(LogLevel.INFO, "default api: " + JSON.stringify(data));
        }
    }
}

export default apis;
mglVar.apis = apis;