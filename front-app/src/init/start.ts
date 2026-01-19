import { apis } from "#api/apis";
import warning from "#common/warning";
import { core_func } from "#core/coreFunc";
import { core_debug } from "#core/debug";
import { socket } from "#core/socket/socket";
import { uih_stateManager } from "#ui/helpers/stateManager";
import { init_translate } from "#utils/translate";

await apis.app.init();

core_func.changeChat("main");
await init_translate();
socket.connect();

setTimeout(async () => {
    await uih_stateManager.handleGetParam();
    uih_stateManager.removeControlParams();
}, 3000);

warning();