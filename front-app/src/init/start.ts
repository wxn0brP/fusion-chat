import hub from "../hub";
import debugFunc from "../core/debug";
import apis from "../api/apis";
import coreFunc from "../core/coreFunc";
import socket from "../core/socket/socket";
import stateManager from "../ui/helpers/stateManager";
import translateFunc from "../utils/translate";
hub("start");

debugFunc.init();
await apis.app.init();

coreFunc.changeChat("main");
translateFunc.init();
socket.connect();

setTimeout(async () => {
    await stateManager.handleGetParam();
    stateManager.removeControlParams();
}, 3000);