import hub from "../../hub";
hub("interact/mainView");

import Id from "../../types/Id";
import uiFunc from "../helpers/uiFunc";
import socket from "../../core/socket/socket";
import mainView from "../components/mainView";
import { mainViewHTML, mglInt } from "../../var/html";
import { Vars_mainView__page } from "../../types/var";
import LangPkg from "../../utils/translate";
import vars from "../../var/var";

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
    },

    requestFriendResponse(user_id: Id, accept: boolean) {
        if (!user_id) return;
        const div = mainViewHTML.div.querySelector(`.main__view__friend[user_id="${user_id}"]`);
        if (!div) return;

        socket.emit("friend.response", user_id, accept);
        div.remove();
        vars.mainView.requests = vars.mainView.requests.filter(e => e != user_id);
        mainViewHTML.requestCount.innerHTML = `(${vars.mainView.requests.length})`;

        if (accept) socket.emit("friend.get.all");
    },
}

export default mainViewInteract;
mglInt.mainView = mainViewInteract;