import hub from "../../hub";
hub("mess/style");

import { messHTML } from "../../var/html";
import utils from "../../utils/utils";
import vars from "../../var/var";
import apis from "../../api/apis";
import { maxMessLen } from "./mess";

const { input } = messHTML

const messStyle = {
    sendBtnStyle() {
        const len = input.value.trim().length;
        let prop = "";

        if (len == 0) prop = "grey";
        else if (len <= maxMessLen) prop = "green";
        else if (len > maxMessLen) prop = "red";

        messHTML.sendBtnImg.style.setProperty("--fil", prop);
        messHTML.sendBtn.disabled = len == 0 || len > maxMessLen;
    },

    messageHeight() {
        let len = input.value.split("\n").length - 1;
        len = len >= 2 ? Math.min(len, 20) : 0;
        input.style.setProperty("--messHeight", len + "rem");
    },

    hideFromMessageInfo() {
        function getTimeFromMess(mess: HTMLElement) {
            const id = mess.id.replace("mess__", "");
            return utils.extractTimeFromId(id);
        }

        const delayTime = 20; // seconds
        const messages = document.querySelectorAll(".mess_message");
        for (let i = 1; i < messages.length; i++) {
            const message = messages[i] as HTMLElement;
            const messageBefore = messages[i - 1] as HTMLElement;

            const messageFrom_author = message.querySelector(".mess_meta").getAttribute("_author");
            const messageBeforeFrom_author = messageBefore.querySelector(".mess_meta").getAttribute("_author");
            if (messageFrom_author != messageBeforeFrom_author) continue;

            const time = getTimeFromMess(message);
            const timeBefore = getTimeFromMess(messageBefore);

            const messageFromText = message.querySelector<HTMLElement>(".mess_meta");
            messageFromText.style.display = time - timeBefore < delayTime ? "none" : "";
        }
    },

    colorRole() {
        const messages = document.querySelectorAll(".mess_message") as NodeListOf<HTMLElement>;
        const roles = vars.realm.roles;
        const users = vars.realm.users;
        const userColor = new Map();

        messages.forEach(mess => {
            const author = mess.querySelector(".mess_meta").getAttribute("_author");

            if (userColor.has(author)) {
                messStyle.colorRoleMess(mess, userColor.get(author));
                return;
            }

            const user = users.find(u => u.uid == author);
            if (!user) return;
            if (user.roles.length == 0) return;
            let color: string;

            for (let i = 0; i < roles.length; i++) {
                if (user.roles.includes(roles[i].name)) {
                    color = roles[i].c;
                    userColor.set(author, color);
                    messStyle.colorRoleMess(mess, color);
                    return;
                }
            }
            messStyle.colorRoleMess(mess, "");
        });
    },

    colorRoleMess(mess: HTMLElement, color: string) {
        mess.querySelector<HTMLElement>(".mess_author_name").style.color = color;
    },

    styleMessReacts(reactsDiv: HTMLElement) {
        const spans = reactsDiv.querySelectorAll("span");
        spans.forEach(span => {
            const users = span.getAttribute("_users").split(",");

            if (users.length == 0 || users[0] == "") {
                span.remove();
                return;
            }

            span.classList.remove("userReacted");
            if (users.includes(vars.user._id)) {
                span.classList.add("userReacted");
            }

            span.title = users.map(u => apis.www.changeUserID(u)).join(", ");
            span.innerHTML = span.getAttribute("_key") + " " + users.length;
        });
    },

    setSelectionStart(position: number | undefined = undefined) {
        if (!position) position = input.value.length;
        input.setSelectionRange(position, position);
    }
}

setTimeout(() => {
    messStyle.sendBtnStyle();
    messStyle.messageHeight();
}, 100); // Delay of 100ms to accommodate any cached input values in the browser

// Paste
input.addEventListener("paste", (e) => {
    e.preventDefault();
    const pasteText = (e.clipboardData || (window as any).clipboardData).getData("text");
    input.value += pasteText;
    messStyle.setSelectionStart();
    messStyle.sendBtnStyle();
    messStyle.messageHeight();
})

export default messStyle;