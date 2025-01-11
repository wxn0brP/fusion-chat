import hub from "../../hub";
hub("interact/relations");

import Id from "../../types/Id";
import uiFunc from "../helpers/uiFunc";
import socket from "../../core/socket/socket";
import { otherHTML, mglVar } from "../../var/html";

const makeRealmDiv = otherHTML.makeRealm;

const buttonFunc = {
    async addDm() {
        const to = await uiFunc.prompt("Name of the 2 people");
        if (!to) return;
        socket.emit("dm.create", to);
    },

    async createRealm() {
        makeRealmDiv.fadeOut();
        const name = await uiFunc.prompt("Name of the realm");
        if (!name) return;
        socket.emit("realm.create", name);
        setTimeout(() => {
            socket.emit("realm.get");
        }, 1500);
    },

    async joinRealm() {
        makeRealmDiv.fadeOut();
        let id = await uiFunc.prompt("Invite link of the realm") as Id;
        if (!id) return;

        id = id
            .replace(location.protocol + "//", "")
            .replace(location.host, "")
            .replace("/ir?id=", "");

        socket.emit("realm.join", id);
    },
}

export default buttonFunc;
mglVar.buttonFunc = buttonFunc;