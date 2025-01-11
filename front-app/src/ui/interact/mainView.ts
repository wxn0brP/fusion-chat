import hub from "../../hub";
hub("interact/mainView");

import Id from "../../types/Id";
import uiFunc from "../helpers/uiFunc";
import socket from "../../core/socket/socket";
import mainView from "../components/mainView";
import { mainViewHTML, mglInt } from "../../var/html";
import { Vars_mainView__page } from "../../types/var";
import LangPkg from "../../utils/translate";

const mainViewInteract = {
    showNav() {
        if (mainViewHTML.nav.clientHeight == 0) {
            mainViewHTML.nav.fadeIn();
        } else {
            mainViewHTML.nav.fadeOut();
        }
    },

    async addFriend(friend: Id) {
        if (!friend) friend = await uiFunc.prompt(LangPkg.ui.enter_friend);
        if (!friend) return;
        socket.emit("friend.request", friend);
    },

    changeView(page: Vars_mainView__page) {
        mainView.changeView(page);
    }
}

export default mainViewInteract;
mglInt.mainView = mainViewInteract;