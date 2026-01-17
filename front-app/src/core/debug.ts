import { apis } from "../api/apis";
import { mglInt } from "../var/mgl";

export namespace debugFunc {
    export let isDebug = localStorage.getItem("config.debug") == "true";
    export let lvl = parseInt(localStorage.getItem("config.debugLvl"), 10) || 0

    setTimeout(() => {
        if (apis.app.apiType == "rn") {
            isDebug = true;
            lvl = 0b1111;
        }
    }, 1000);

    export function msg(level: number, ...data: any) {
        if (!this.isDebug) return;

        if ((this.lvl & level) === 0) return;

        console.log(...data);
        if (apis.app.apiType == "rn") {
            apis.api.send({ type: "debug", msg: (data.length == 1 ? data[0] : data) });
        }
    }
}

export enum LogLevel {
    INFO = 0b0001,
    WARN = 0b0010,
    ERROR = 0b0100,
    SOCKET_ERROR = 0b1000,
}

mglInt.debug = {
    enable(info: boolean, warn: boolean, error: boolean, socketError: boolean) {
        debugFunc.isDebug = info || warn || error || socketError;
        const lvl =
            (info ? 0b0001 : 0) |
            (warn ? 0b0010 : 0) |
            (error ? 0b0100 : 0) |
            (socketError ? 0b1000 : 0);
        localStorage.setItem("config.debug", debugFunc.isDebug.toString());
        localStorage.setItem("config.debugLvl", lvl.toString());
    },
    disable() {
        debugFunc.isDebug = false;
        debugFunc.lvl = 0;
        localStorage.setItem("config.debug", debugFunc.isDebug.toString());
        localStorage.setItem("config.debugLvl", "0");
    },
}