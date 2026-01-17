import { debugFunc, LogLevel } from "../core/debug";
import { mglVar } from "../var/mgl";
import { changeChat, changeUserID, getInServer } from "./www";

export const apis = {
    www: {
        changeUserID,
        changeChat,
        getInServer
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

mglVar.apis = apis;