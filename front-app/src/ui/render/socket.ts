import hub from "../../hub";
hub("render/socket");

import socket from "../../core/socket/socket";
import vars from "../../var/var";
import render_dm from "./dm";
import render_realm from "./realm";
import render_user from "./user";
import realmInit from "./realmInit";
import { Core_socket__blocked, Core_socket__dm } from "../../types/core/socket";
import coreFunc from "../../core/coreFunc";

socket.on("dm.get", (data: Core_socket__dm[], blocked: Core_socket__blocked[]) => {
    data.forEach((priv) => {
        const id = "$" + priv.priv;

        vars.lastMess[id] = vars.lastMess[id] || {};
        vars.lastMess[id].main = {
            read: priv.last?.main ?? null,
            mess: priv.lastMessId ?? null,
        }
    })
    vars.privs = data.map(d => d.priv);
    render_dm.chats();

    vars.blocked = blocked;
    if(vars.chat.to.startsWith("$")) coreFunc.dmPlaceholder(vars.chat.to.substring(1));
});

socket.on("realm.get", render_realm.realms);
socket.on("realm.setup", realmInit);
socket.on("user.profile", render_user.userProfile);
