import hub from "../../hub.js";
hub("mess/listeners");
import messFunc from "./mess.js";
import messStyle from "./style.js";
import vars from "../../var/var.js";
import { messHTML } from "../../var/html.js";
import uiInteract from "../../ui/interact/ui.js";
const { input } = messHTML;
input.addEventListener("keydown", (e) => {
    if (e.key != "Enter")
        return;
    if (e.shiftKey)
        return;
    e.preventDefault();
    messFunc.sendMess();
});
input.addEventListener("keydown", (e) => {
    if (e.key != "ArrowUp" || input.value.length > 0)
        return;
    e.preventDefault();
    const messages = document.querySelectorAll(".mess_message");
    const lastUserMessage = Array.from(messages).reverse().find(message => message.querySelector(".mess_meta").getAttribute("_author") === vars.user._id);
    if (!lastUserMessage)
        return;
    const id = lastUserMessage.id.split("mess__")[1];
    if (!id)
        return;
    uiInteract.editMess(id);
});
input.addEventListener("keydown", (e) => {
    if (e.key != "ArrowDown" || input.value.length > 0)
        return;
    e.preventDefault();
    const lastMessage = document.querySelector(".mess_message:last-child");
    if (!lastMessage)
        return;
    const id = lastMessage.id.split("mess__")[1];
    if (!id)
        return;
    vars.temp.replyId = id;
    messHTML.replyClose.style.display = "block";
    lastMessage.style.backgroundColor = "var(--panel)";
});
input.addEventListener("input", messStyle.sendBtnStyle);
input.addEventListener("input", messStyle.messageHeight);
function pasteText(e) {
    if (!pasteCheck())
        return;
    e.preventDefault();
    const pasteText = (e.clipboardData || window.clipboardData).getData("text");
    input.value += pasteText;
    messStyle.setSelectionStart();
    messStyle.sendBtnStyle();
    messStyle.messageHeight();
}
function pasteImage(e) {
    if (!pasteCheck())
        return;
    const items = (e.clipboardData || e.originalEvent.clipboardData).items;
    for (const item of items) {
        if (item.type.indexOf("image") === -1)
            continue;
        e.preventDefault();
        const file = item.getAsFile();
        messFunc.sendFile(file);
    }
}
function pasteCheck() {
    const tag = document.activeElement.tagName.toLowerCase();
    if (tag == "input" || tag == "textarea")
        return false;
    return true;
}
document.addEventListener("paste", pasteText);
document.addEventListener("paste", pasteImage);
document.addEventListener("paste", () => {
    if (input == document.activeElement)
        return;
    const tag = document.activeElement.tagName.toLowerCase();
    if (tag == "input" || tag == "textarea")
        return;
    input.focus();
    messStyle.setSelectionStart();
});
document.addEventListener("keydown", (e) => {
    if (input == document.activeElement)
        return;
    if (e.ctrlKey)
        return;
    if (e.altKey)
        return;
    const tag = document.activeElement.tagName.toLowerCase();
    if (tag == "input" || tag == "textarea")
        return;
    input.focus();
    messStyle.setSelectionStart();
});
document.addEventListener("keydown", (e) => {
    if (e.key != "Delete")
        return;
    if (!vars.chat.selectedMess)
        return;
    uiInteract.deleteMess(vars.chat.selectedMess);
});
//# sourceMappingURL=listeners.js.map