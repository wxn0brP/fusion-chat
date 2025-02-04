import hub from "../hub.js";
hub("debug");
import apis from "../api/apis.js";
import { mglInt } from "../var/mgl.js";
const debugFunc = {
    isDebug: localStorage.getItem("config.debug") == "true",
    lvl: parseInt(localStorage.getItem("config.debugLvl"), 10) || 0,
    init() {
        setTimeout(() => {
            if (apis.app.apiType == "rn") {
                this.isDebug = true;
                this.lvl = 0b1111;
            }
        }, 1000);
    },
    msg(level, ...data) {
        if (!this.isDebug)
            return;
        if ((this.lvl & level) === 0)
            return;
        lo(...data);
        if (apis.app.apiType == "rn") {
            apis.api.send({ type: "debug", msg: (data.length == 1 ? data[0] : data) });
        }
    },
};
export var LogLevel;
(function (LogLevel) {
    LogLevel[LogLevel["INFO"] = 1] = "INFO";
    LogLevel[LogLevel["WARN"] = 2] = "WARN";
    LogLevel[LogLevel["ERROR"] = 4] = "ERROR";
    LogLevel[LogLevel["SOCKET_ERROR"] = 8] = "SOCKET_ERROR";
})(LogLevel || (LogLevel = {}));
export default debugFunc;
mglInt.debug = {
    enable(info, warn, error, socketError) {
        debugFunc.isDebug = info || warn || error || socketError;
        const lvl = (info ? 0b0001 : 0) |
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
};
//# sourceMappingURL=debug.js.map