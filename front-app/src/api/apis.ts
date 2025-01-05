import hub from "../hub";
hub("apis");

import debugFunc from "../core/debug";
import uiFunc from "../ui/helpers/uiFunc";
import translateFunc from "../utils/translate";
import vars from "../var/var";
import { mglVar } from "../var/html";
import cw from "../core";
import Id from "../types/Id";

const apis = {
    www: {
        changeUserID(id: Id): string {
            const chat = vars.chat.to;
            const temp = vars.apisTemp.user;

            if (chat.startsWith("$") || chat == "main") { // if dm or main
                if (temp.main[id]) return temp.main[id];
                const data = apis.www.getInServer("/api/id/u?id=" + id).name;
                if(!data) return "Unknown";
                temp.main[id] = data;
                return data;
            }

            // if realm
            if (!temp[chat]) temp[chat] = {};

            const issetData = temp[chat][id];
            if (issetData) return issetData;
            if (issetData == 0) return temp.main[id];

            if (id.startsWith("%")) { // if webhook
                const data = apis.www.getInServer("/api/id/wh?id=" + id.replace("%", "") + "&chat=" + chat).name + " (APP)";
                if(!data) return "Unknown";
                temp[chat][id] = data;
                return data;
            } else if (id.startsWith("^")) { // if bot
                const data = apis.www.getInServer("/api/id/bot?id=" + id.replace("^", "") + "&chat=" + chat).name + " (BOT)";
                if(!data) return "Unknown";
                temp[chat][id] = data;
                return data;
            } else if (id.startsWith("(")) { // if event chnl
                const data = apis.www.getInServer("/api/id/event?id=" + id.replace("(", "")).name + " (EVENT)";
                if(!data) return "Unknown";
                temp[chat][id] = data;
                return data;
            }
            else { // if user in chat
                const data: { err: boolean, name: string, c: -1 | 0 | 1 } | null = apis.www.getInServer("/api/id/u?id=" + id + "&chat=" + chat);
                if(!data) return "Unknown";
                if(data.c == 1){
                    temp[chat][id] = data.name;
                    return data.name;
                }
                else if(data.c == 0){
                    temp[chat][id] = 0;
                    if(temp.main[id]) return temp.main[id];
                    const data = apis.www.getInServer("/api/id/u?id=" + id).name;
                    if(!data) return "Unknown";
                    temp.main[id] = data.name;
                    return data.name;
                }else{
                    temp.main[id] = data.name;
                    return data.name;
                }
            }
        },

        changeChat(id: Id): string {
            if (vars.apisTemp.chat[id]) return vars.apisTemp.chat[id];
            const data = apis.www.getInServer("/api/id/chat?chat=" + id).name;
            vars.apisTemp.chat[id] = data;
            return data;
        },

        getInServer(url: string): any { // TODO fix type
            const dataS = cw.get(url);
            const data = JSON.parse(dataS);
            if (data.err) {
                uiFunc.uiMsg(translateFunc.get("Error fetching data from the server") + ".");
                debugFunc.msg(data);
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

            apis.api = await import("./devices/" + path + ".js");
            debugFunc.msg("load api: " + path);
        },
        apiType: "",
    },
    api: {
        send(data: any): void {
            debugFunc.msg("default api: " + JSON.stringify(data));
        }
    }
}

export default apis;
mglVar.apis = apis;