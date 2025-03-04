import hub from "../../hub.js";
hub("interact/mainView");
import uiFunc from "../helpers/uiFunc.js";
import socket from "../../core/socket/socket.js";
import mainView from "../components/mainView.js";
import { mainViewHTML } from "../../var/html.js";
import { mglInt } from "../../var/mgl.js";
import LangPkg from "../../utils/translate.js";
import vars from "../../var/var.js";
const mainViewInteract = {
    showNav() {
        if (mainViewHTML.nav.clientHeight == 0) {
            mainViewHTML.nav.fadeIn();
        }
        else {
            mainViewHTML.nav.fadeOut();
        }
    },
    async addFriend(friend) {
        if (!friend)
            friend = await uiFunc.prompt(LangPkg.ui.enter_friend);
        if (!friend)
            return;
        socket.emit("friend.request", friend);
    },
    changeView(page) {
        mainView.changeView(page);
    },
    requestFriendResponse(user_id, accept) {
        if (!user_id)
            return;
        const div = mainViewHTML.div.querySelector(`.main__view__friend[data-status-id="${user_id}"]`);
        if (!div)
            return;
        socket.emit("friend.response", user_id, accept);
        div.remove();
        vars.mainView.requests = vars.mainView.requests.filter(e => e != user_id);
        mainViewHTML.requestCount.innerHTML = `(${vars.mainView.requests.length})`;
        if (accept)
            socket.emit("friend.get.all");
    },
};
export default mainViewInteract;
mglInt.mainView = mainViewInteract;
//# sourceMappingURL=mainView.js.map