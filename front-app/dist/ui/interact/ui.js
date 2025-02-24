import hub from "../../hub.js";
hub("interact/ui");
import vars from "../../var/var.js";
import { messHTML } from "../../var/html.js";
import coreFunc from "../../core/coreFunc.js";
import messStyle from "../../core/mess/style.js";
import socket from "../../core/socket/socket.js";
import uiFunc, { promptDiv } from "../helpers/uiFunc.js";
import KeyState from "../../var/keys.js";
import LangPkg from "../../utils/translate.js";
import { socketEvt } from "../../core/socket/engine.js";
const uiInteract = {
    editMess(id) {
        const messageDiv = document.querySelector("#mess__" + id + " .mess_content");
        if (!messageDiv)
            return;
        const message = messageDiv.getAttribute("_plain");
        messHTML.input.value = message;
        vars.temp.editId = id;
        messHTML.editClose.style.display = "block";
        coreFunc.focusInp(true);
        messStyle.sendBtnStyle();
        messStyle.messageHeight();
        messStyle.setSelectionStart();
    },
    clipboardError(text) {
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
    async createThread(messId = null) {
        const { to, chnl } = vars.chat;
        if (!to || !chnl)
            return;
        if (to.startsWith("$"))
            return;
        if (!vars.realm.chnlPerms[chnl]?.threadCreate)
            return;
        const name = await uiFunc.prompt(LangPkg.ui.create_thread_name);
        if (!name)
            return;
        socket.emit("realm.thread.create", to, chnl, name, messId, () => {
            socketEvt["realm.thread.list"].emitId(to + "=" + chnl, to, chnl);
        });
    },
    async deleteMess(id) {
        const keys = KeyState.shift || KeyState.ctrl;
        if (!keys) {
            const conf = await uiFunc.confirm(LangPkg.ui.confirm.delete_message + "?");
            if (!conf)
                return;
        }
        socket.emit("message.delete", vars.chat.to, id);
    }
};
export default uiInteract;
//# sourceMappingURL=ui.js.map