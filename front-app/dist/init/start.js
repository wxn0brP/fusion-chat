import hub, { reqButNotReg, regButNotReq, getReg, getReq } from "../hub.js";
hub("start");
import debugFunc, { LogLevel } from "../core/debug.js";
import apis from "../api/apis.js";
import coreFunc from "../core/coreFunc.js";
import socket from "../core/socket/socket.js";
import stateManager from "../ui/helpers/stateManager.js";
import { init_translate } from "../utils/translate.js";
debugFunc.init();
await apis.app.init();
coreFunc.changeChat("main");
await init_translate();
socket.connect();
setTimeout(async () => {
    await stateManager.handleGetParam();
    stateManager.removeControlParams();
}, 3000);
setTimeout(async () => {
    const unexpected = regButNotReq();
    const unregistered = reqButNotReg();
    const reg = getReg().length;
    const req = getReq().length;
    debugFunc.msg(LogLevel.INFO, `Loaded ${reg}/${req} (${Math.round(reg / req * 100)}%) modules.`);
    if (unexpected.length > 0)
        debugFunc.msg(LogLevel.WARN, "Unexpected modules:", unexpected);
    if (unregistered.length > 0)
        debugFunc.msg(LogLevel.WARN, "Unregistered modules:", unregistered);
}, 1000);
//# sourceMappingURL=start.js.map