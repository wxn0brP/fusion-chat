import hub from "../../hub.js";
hub("render/dm");

import { navHTML } from "../../var/html.js";
import vars from "../../var/var.js";
import coreFunc from "../../core/coreFunc.js";
import renderUtils from "./utils.js";
import utils from "../../utils/utils.js";
import apis from "../../api/apis.js";

const render_dm = {
    chats(){
        navHTML.priv.innerHTML = "";

        renderUtils.sortPrivs(vars.privs).forEach((id) => {
            const privDiv = document.createElement("button");
            privDiv.classList.add("priv_chat");
            privDiv.classList.add("btn");
            privDiv.id = "priv_chat_"+id;

            const structDiv = document.createElement("div");

            const profileImg = document.createElement("img");
            profileImg.src = "/api/profile/img?id=" + id;
            structDiv.appendChild(profileImg);

            structDiv.innerHTML += apis.www.changeUserID(id);
            privDiv.appendChild(structDiv);
            navHTML.priv.appendChild(privDiv);

            privDiv.addEventListener("click", () => {
                coreFunc.changeChat("$"+id);
                setTimeout(() => {
                    render_dm.privsRead();
                }, 100);
            });
        });
        render_dm.privsRead();
        coreFunc.markSelectedChat();
    },

    privsRead(){
        vars.privs.forEach((id) => {
            const cl = document.querySelector("#priv_chat_"+id)?.classList;
            if(!cl) return;

            const l = vars.lastMess["$"+id]?.main;
            if(!l) return;
            let unreadPriv = false;

            if(l.read != null && l.mess != null){
                unreadPriv = utils.extractTimeFromId(l.read) < utils.extractTimeFromId(l.mess);
            }else if(l.read == null && l.mess != null){
                unreadPriv = true;
            }

            unreadPriv ? cl.add("unreadPriv") : cl.remove("unreadPriv");
        });
    },
}

export default render_dm;