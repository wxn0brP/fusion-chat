import hub from "../../hub.js";
hub("buttons");

import uiFunc from "../helpers/uiFunc.js";
import socket from "../../core/socket/ws.js";
import { otherHTML, magistral } from "../../var/html.js";
const makeRealmDiv = otherHTML.makeRealm;
import settingsFunc from "../settings/settings.js";

const buttonFunc = {
    async addPriv(){
        const to = await uiFunc.prompt("Name of the 2 people");
        if(!to) return;
        socket.emit("dm.create", to);
    },

    async createRealm(){
        makeRealmDiv.fadeOut();
        const name = await uiFunc.prompt("Name of the realm");
        if(!name) return;
        socket.emit("realm.create", name);
        setTimeout(() => {
            socket.emit("realm.get");
        }, 1500);
    },

    async joinRealm(){
        makeRealmDiv.fadeOut(); 
        let id = await uiFunc.prompt("Invite link of the realm");
        if(!id) return;

        id = id
            .replace(location.protocol + "//", "")
            .replace(location.host, "")
            .replace("/ir?id=", "");

        socket.emit("realm.join", id);
    },

    userSettings(){
        settingsFunc.showUserSettings();
    },
}

export default buttonFunc;
magistral.buttonFunc = buttonFunc;