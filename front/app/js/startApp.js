import { reqButNotReg, regButNotReq, getReg, getReq } from "./hub.js";

// init
await import("./init/init.js");
await import("./var/var.js");
await import("./var/html.js");

// features
await import("./core/socket/socket.js");
await import("./core/socket/evt.js");
await import("./core/mess/messSocket.js");
await import("./core/mess/listeners.js");
await import("./init/features.js");
await import("./ui/components/media.js");
await import("./ui/components/voice.js");
await import("./ui/settings/settings.js");

// ui interact
await import("./ui/interact/context.js");
await import("./ui/interact/mainView.js");
await import("./ui/interact/relations.js");
await import("./ui/interact/subscribeEventChnl.js");

// start app
await import("./init/start.js");
await import("./common/warning.js");

setTimeout(() => {
    const unexpected = regButNotReq();
    const unregistered = reqButNotReg();
    const reg = getReg().length;
    const req = getReq().length;
    console.log(`Loaded ${reg}/${req} (${Math.round(reg/req*100)}%) modules.`);
    if(unexpected.length > 0) console.log("Unexpected modules:", unexpected);
    if(unregistered.length > 0) console.log("Unregistered modules:", unregistered);
}, 100)
