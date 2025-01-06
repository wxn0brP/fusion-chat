import hub, { reqButNotReg, regButNotReq, getReg, getReq } from "../hub";
hub("start");

import debugFunc from "../core/debug";
import apis from "../api/apis";
import coreFunc from "../core/coreFunc";
import socket from "../core/socket/socket";
import stateManager from "../ui/helpers/stateManager";
import translateFunc from "../utils/translate";

debugFunc.init();
await apis.app.init();

coreFunc.changeChat("main");
translateFunc.init();
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
    debugFunc.msg(`Loaded ${reg}/${req} (${Math.round(reg/req*100)}%) modules.`);
    if(unexpected.length > 0) debugFunc.msg("Unexpected modules:", unexpected);
    if(unregistered.length > 0) debugFunc.msg("Unregistered modules:", unregistered);
}, 1000);
