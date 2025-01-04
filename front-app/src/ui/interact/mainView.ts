import hub from "../../hub.js";
hub("interact/mainView");

import { mainViewHTML, mglInt } from "../../var/html.js";
import translateFunc from "../../utils/translate.js";
import uiFunc from "../helpers/uiFunc.js";
import socket from "../../core/socket/socket.js";
import mainView from "../components/mainView.js";

const mainViewInteract = {
    showNav(){
        if(mainViewHTML.nav.clientHeight == 0){
            mainViewHTML.nav.fadeIn();
        }else{
            mainViewHTML.nav.fadeOut();
        }
    },

    async addFriend(friend){
        if(!friend) friend = await uiFunc.prompt(translateFunc.get("Enter friend Name"));
        
        if(!friend) return;
        socket.emit("friend.request", friend);
    },

    changeView(page){
        mainView.changeView(page);
    }
}

export default mainViewInteract;
mglInt.mainView = mainViewInteract;