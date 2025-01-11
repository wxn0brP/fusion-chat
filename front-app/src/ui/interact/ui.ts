import hub from "../../hub";
hub("interact/ui");

import Id from "../../types/Id";
import vars from "../../var/var";
import { messHTML } from "../../var/html";
import coreFunc from "../../core/coreFunc";
import messStyle from "../../core/mess/style";
import socket from "../../core/socket/socket";
import uiFunc, { promptDiv } from "../helpers/uiFunc";
import KeyState from "../../var/keys";
import LangPkg from "../../utils/translate";

const uiInteract = {
    editMess(id: Id) {
        const messageDiv = document.querySelector("#mess__" + id + " .mess_content");
        if (!messageDiv) return;
        const message = messageDiv.getAttribute("_plain");
        messHTML.input.value = message;
        vars.temp.editId = id;

        messHTML.editClose.style.display = "block";
        coreFunc.focusInp(true);
        messStyle.sendBtnStyle();
        messStyle.messageHeight();
        messStyle.setSelectionStart();
    },

    clipboardError(text: string) {
        const div = document.createElement("div");
        div.style.opacity = "0";
        div.classList.add("prompt");
        div.innerHTML = "<h2>" + LangPkg.ui.clipboard.error + ".</h2>";
        div.innerHTML += "<h3>" + LangPkg.ui.clipboard.error_text + ".</h3>";

        div.appendChild(document.createElement("br"));

        const textarea = document.createElement("textarea");
        textarea.value = text;
        div.appendChild(textarea);

        div.appendChild(document.createElement("br"));

        const btn = document.createElement("button");
        btn.innerHTML = "OK";
        div.appendChild(btn);
        btn.addEventListener("click", () => {
            div.fadeOut();
            setTimeout(() => {
                div.remove();
            }, 2000);
        });

        promptDiv.appendChild(div);
        div.fadeIn(() => {
            textarea.select();
        });
    },

    async createThread(messId: Id = null) {
        const { to, chnl } = vars.chat;
        if (!to || !chnl) return;
        if (to.startsWith("$")) return;
        if (!vars.realm.chnlPerms[chnl]?.threadCreate) return;

        const name = await uiFunc.prompt("Name of the thread");
        if (!name) return;

        socket.emit("realm.thread.create", to, chnl, name, messId, () => {
            socket.emit("realm.thread.list", to, chnl);
        });
    },

    deleteMess(id: Id) {
        const keys = KeyState.shift || KeyState.ctrl; // if shift or ctrl is pressed skip confirmation
        if (!keys) {
            const conf = confirm(LangPkg.ui.confirm.delete_message + "?"); // TODO rm mess confirm make better (popup with content) 
            if (!conf) return;
        }
        socket.emit("message.delete", vars.chat.to, id);
    }
}

export default uiInteract;