import hub from "../hub.js";
hub("start");
import debugFunc from "../core/debug.js";
import apis from "../api/apis.js";
import coreFunc from "../core/coreFunc.js";
import socket from "../core/socket/ws.js";
import stateManager from "../ui/helpers/stateManager.js";
import translateFunc from "../utils/translate.js";

debugFunc.init();
await apis.app.init();

coreFunc.changeChat("main");
translateFunc.init();
socket.connect();

setTimeout(async () => {
    await stateManager.handleGetParam();
    stateManager.removeControlParams();
}, 3000);