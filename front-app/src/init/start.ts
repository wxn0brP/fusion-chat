import apis from "#api/apis";
import warning from "#common/warning";
import coreFunc from "#core/coreFunc";
import debugFunc from "#core/debug";
import socket from "#core/socket/socket";
import stateManager from "#ui/helpers/stateManager";
import { init_translate } from "#utils/translate";

debugFunc.init();
await apis.app.init();

coreFunc.changeChat("main");
await init_translate();
socket.connect();

setTimeout(async () => {
    await stateManager.handleGetParam();
    stateManager.removeControlParams();
}, 3000);

warning();