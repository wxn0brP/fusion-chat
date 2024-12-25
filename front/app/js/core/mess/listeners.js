import hub from "../../hub.js";
hub("mess/listeners");

import { messHTML } from "../../var/html.js";
import vars from "../../var/var.js";
import messFunc from "./mess.js";
import messStyle from "./style.js";
import uiFunc from "../../ui/helpers/uiFunc.js";

messHTML.inputRaw.addEventListener("keydown", (e) => {
    if(e.key != "Enter") return;
    if(e.shiftKey) return; //if shift + enter - new line

    e.preventDefault();
    messFunc.sendMess();
});

messHTML.inputRaw.addEventListener("keydown", (e) => {
    if(e.key != "ArrowUp" || messHTML.input.value.length > 0) return;
    e.preventDefault();

    const messages = document.querySelectorAll(".mess_message");
    const lastUserMessage = Array.from(messages).reverse().find(message => 
        message.querySelector(".mess_meta").getAttribute("_author") === vars.user._id
    );
    if(!lastUserMessage) return;

    const id = lastUserMessage.id.split("mess__")[1];
    if(!id) return;

    uiFunc.editMess(id);
});

messHTML.inputRaw.addEventListener("keydown", (e) => {
    if(e.key != "ArrowDown" || messHTML.input.value.length > 0) return;
    e.preventDefault();

    const lastMessage = document.querySelector(".mess_message:last-child");
    if(!lastMessage) return;

    const id = lastMessage.id.split("mess__")[1];
    if(!id) return;

    vars.temp.replyId = id;
    messHTML.replyClose.style.display = "block";
    lastMessage.style.backgroundColor = "var(--panel)";
});

messHTML.inputRaw.addEventListener("input", messStyle.sendBtnStyle);
messHTML.inputRaw.addEventListener("input", messStyle.messageHeight);