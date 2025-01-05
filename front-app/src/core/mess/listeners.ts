import hub from "../../hub";
hub("mess/listeners");

import messFunc from "./mess";
import messStyle from "./style";
import vars from "../../var/var";
import { messHTML } from "../../var/html";
import uiInteract from "../../ui/interact/ui";

messHTML.input.addEventListener("keydown", (e) => {
    if(e.key != "Enter") return;
    if(e.shiftKey) return; //if shift + enter - new line

    e.preventDefault();
    messFunc.sendMess();
});

messHTML.input.addEventListener("keydown", (e) => {
    if(e.key != "ArrowUp" || messHTML.input.value.length > 0) return;
    e.preventDefault();

    const messages = document.querySelectorAll(".mess_message");
    const lastUserMessage = Array.from(messages).reverse().find(message => 
        message.querySelector(".mess_meta").getAttribute("_author") === vars.user._id
    );
    if(!lastUserMessage) return;

    const id = lastUserMessage.id.split("mess__")[1];
    if(!id) return;

    uiInteract.editMess(id);
});

messHTML.input.addEventListener("keydown", (e) => {
    if(e.key != "ArrowDown" || messHTML.input.value.length > 0) return;
    e.preventDefault();

    const lastMessage = document.querySelector(".mess_message:last-child") as HTMLElement;
    if(!lastMessage) return;

    const id = lastMessage.id.split("mess__")[1];
    if(!id) return;

    vars.temp.replyId = id;
    messHTML.replyClose.style.display = "block";
    lastMessage.style.backgroundColor = "var(--panel)";
});

messHTML.input.addEventListener("input", messStyle.sendBtnStyle);
messHTML.input.addEventListener("input", messStyle.messageHeight);