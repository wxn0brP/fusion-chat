import globalExpose from "#bus";
import { $store } from "#store";

const debugFunc = {
    isDebug: localStorage.getItem("config.debug") == "true",
    lvl: parseInt(localStorage.getItem("config.debugLvl"), 10) || 0,

    init() {
        setTimeout(() => {
            // if (apis.app.apiType == "rn"){
            //     this.isDebug = true;
            //     this.lvl = 0b1111;
            // }
        }, 1000);
    },

    msg(level: number, ...data: any) {
        if (!this.isDebug) return;

        if ((this.lvl & level) === 0) return;

        console.log(...data);
        // if (apis.app.apiType == "rn") {
        //     apis.api.send({ type: "debug", msg: (data.length == 1 ? data[0] : data) });
        // }
    },

    logStore(opts?: { json?: boolean, select?: string[] }) {
        if (!this.isDebug) return;
        if (!opts) opts = {};

        let data = logStore($store);
        if (opts.select)
            for (const key of opts.select)
                data = data[key];

        if (opts.json) data = JSON.stringify(data, null, 2);
        console.log(data);
    }
};

function logStore(data: any) {
    if (!data) return null;
    if (data.value !== undefined) return data.get();

    const res: any = {};
    for (const key of Object.keys(data)) {
        if (typeof data[key] == "function") continue;
        if (key === "listeners") continue;
        if (key === "value") continue;
        res[key] = logStore(data[key]);
    }
    return res;
}

export enum LogLevel {
    INFO = 0b0001,
    WARN = 0b0010,
    ERROR = 0b0100,
    SOCKET_ERROR = 0b1000,
}

export default debugFunc;

globalExpose("debug", "mgr", {
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

    help() {
        console.log(`info, warn, error, socketError`);
    },
});

globalExpose("debug", "logStore", (opts) => {
    debugFunc.logStore(opts);
});