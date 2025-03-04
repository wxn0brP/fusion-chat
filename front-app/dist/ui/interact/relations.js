import hub from "../../hub.js";
hub("interact/relations");
import uiFunc from "../helpers/uiFunc.js";
import socket from "../../core/socket/socket.js";
import { otherHTML } from "../../var/html.js";
import { mglVar } from "../../var/mgl.js";
import LangPkg from "../../utils/translate.js";
const makeRealmDiv = otherHTML.makeRealm;
const buttonFunc = {
    async addDm() {
        const to = await uiFunc.prompt(LangPkg.ui.enter_dm);
        if (!to)
            return;
        socket.emit("dm.create", to);
    },
    async createRealm() {
        makeRealmDiv.fadeOut();
        const name = await uiFunc.prompt(LangPkg.ui.create_realm_name);
        if (!name)
            return;
        socket.emit("realm.create", name);
        setTimeout(() => {
            socket.emit("realm.get");
        }, 1500);
    },
    async joinRealm() {
        makeRealmDiv.fadeOut();
        let id = await uiFunc.prompt(LangPkg.ui.enter_realm_invite);
        if (!id)
            return;
        id = id
            .replace(location.protocol + "//", "")
            .replace(location.host, "")
            .replace("/ir?id=", "");
        socket.emit("realm.join", id);
    },
};
export default buttonFunc;
mglVar.buttonFunc = buttonFunc;
//# sourceMappingURL=relations.js.map