import hub from "../../hub";
hub("interact/mainView");

import uiFunc from "../helpers/uiFunc";
import socket from "../../core/socket/socket";
import mainView from "../components/mainView";
import translateFunc from "../../utils/translate";
import { mainViewHTML, mglInt } from "../../var/html";

const mainViewInteract = {
    showNav() {
        if (mainViewHTML.nav.clientHeight == 0) {
            mainViewHTML.nav.fadeIn();
        } else {
            mainViewHTML.nav.fadeOut();
        }
    },

    async addFriend(friend) {
        if (!friend) friend = await uiFunc.prompt(translateFunc.get("Enter friend Name"));

        if (!friend) return;
        socket.emit("friend.request", friend);
    },

    changeView(page) {
        mainView.changeView(page);
    }
}

export default mainViewInteract;
mglInt.mainView = mainViewInteract;