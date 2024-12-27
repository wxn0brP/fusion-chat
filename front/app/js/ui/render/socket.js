import hub from "../../hub.js";
hub("render/socket");

import socket from "../../core/socket/socket.js";
import vars from "../../var/var.js";
import render_dm from "./dm.js";
import render_realm from "./realm.js";
import render_user from "./user.js";
import realmInit from "./realmInit.js";

socket.on("dm.get", (data) => {
    data.forEach((priv) => {
        const id = "$"+priv.priv;

        vars.lastMess[id] = vars.lastMess[id] || {};
        vars.lastMess[id].main = {
            read: priv.last?.main ?? null,
            mess: priv.lastMessId ?? null,
        }
    })
    vars.privs = data.map(d => d.priv);
    render_dm.chats();
});

socket.on("realm.get", render_realm.realms);
socket.on("realm.setup", realmInit);
socket.on("user.profile", render_user.userProfile);
