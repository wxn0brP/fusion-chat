import hub from "../../hub";
hub("render/socket");

import socket from "../../core/socket/socket";
import render_realm from "./realm";
import render_user from "./user";
import realmInit from "./realmInit";
import render_dm from "./dm";

socket.on("dm.get", render_dm.dm_get);
socket.on("realm.get", render_realm.realms);
socket.on("realm.setup", realmInit);
socket.on("user.profile", render_user.userProfile);
