import hub from "../../hub.js";
hub("render/socket");
import socket from "../../core/socket/socket.js";
import render_realm from "./realm.js";
import render_user from "./user.js";
import realmInit from "./realmInit.js";
import render_dm from "./dm.js";
socket.on("dm.get", render_dm.dm_get);
socket.on("realm.get", render_realm.realms);
socket.on("realm.setup", realmInit);
socket.on("user.profile", render_user.userProfile);
//# sourceMappingURL=socket.js.map