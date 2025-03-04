import hub from "../hub.js";
hub("apis");
import debugFunc, { LogLevel } from "../core/debug.js";
import uiFunc from "../ui/helpers/uiFunc.js";
import vars from "../var/var.js";
import { mglVar } from "../var/mgl.js";
import cw from "../core.js";
import LangPkg from "../utils/translate.js";
import changeCodeToString from "../utils/code.js";
import apiVars from "../var/api.js";
const apis = {
    www: {
        changeUserID(id) {
            const chat = vars.chat.to;
            const temp = apiVars.temp.user;
            if (chat.startsWith("$") || chat == "main") {
                if (temp.main[id])
                    return temp.main[id];
                const data = apis.www.getInServer("/api/id/u?id=" + id).name;
                if (!data)
                    return "Unknown";
                temp.main[id] = data;
                return data;
            }
            if (!temp[chat])
                temp[chat] = {};
            const issetData = temp[chat][id];
            if (issetData)
                return issetData;
            if (issetData == 0)
                return temp.main[id];
            if (id.startsWith("%")) {
                const data = apis.www.getInServer("/api/id/wh?id=" + id.replace("%", "") + "&chat=" + chat).name + " (APP)";
                if (!data)
                    return "Unknown";
                temp[chat][id] = data;
                return data;
            }
            else if (id.startsWith("^")) {
                const data = apis.www.getInServer("/api/id/bot?id=" + id.replace("^", "") + "&chat=" + chat).name + " (BOT)";
                if (!data)
                    return "Unknown";
                temp[chat][id] = data;
                return data;
            }
            else if (id.startsWith("(")) {
                const data = apis.www.getInServer("/api/id/event?id=" + id.replace("(", "")).name + " (EVENT)";
                if (!data)
                    return "Unknown";
                temp[chat][id] = data;
                return data;
            }
            else {
                const data = apis.www.getInServer("/api/id/u?id=" + id + "&chat=" + chat);
                if (!data)
                    return "Unknown";
                if (data.c == 1) {
                    temp[chat][id] = data.name;
                    return data.name;
                }
                else if (data.c == 0) {
                    temp[chat][id] = 0;
                    if (temp.main[id])
                        return temp.main[id];
                    const name = apis.www.getInServer("/api/id/u?id=" + id).name;
                    if (!name)
                        return "Unknown";
                    temp.main[id] = name;
                    return name;
                }
                else {
                    temp.main[id] = data.name;
                    return data.name;
                }
            }
        },
        changeChat(id) {
            if (apiVars.temp.realm[id])
                return apiVars.temp.realm[id];
            const data = apis.www.getInServer("/api/id/chat?chat=" + id).name;
            apiVars.temp.realm[id] = data;
            return data;
        },
        getInServer(url) {
            const dataS = cw.get(url);
            const data = JSON.parse(dataS);
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
        async init() {
            const dev = {
                isElectron: navigator.userAgent.toLowerCase().includes("electron"),
                isInIframe: window.self !== window.top,
                isReactNative: !!window.ReactNativeWebView,
            };
            let path = "web";
            if (dev.isElectron)
                path = "ele";
            else if (dev.isReactNative)
                path = "rn";
            else if (dev.isInIframe)
                path = "if";
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
        send(data) {
            debugFunc.msg(LogLevel.INFO, "default api: " + JSON.stringify(data));
        }
    }
};
export default apis;
mglVar.apis = apis;
//# sourceMappingURL=apis.js.map