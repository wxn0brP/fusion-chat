import { messHTML } from "#var/html";
import { utils } from "#utils/utils";
import { vars } from "#var/var";
import { apis } from "#api/apis";
import { maxMessLen } from "./mess";

const { input } = messHTML;

export namespace messStyle {
    export function sendBtnStyle() {
        const len = input.value.trim().length;
        let prop = "";

        if (len == 0) prop = "grey";
        else if (len <= maxMessLen) prop = "green";
        else if (len > maxMessLen) prop = "red";

        messHTML.sendBtnImg.style.setProperty("--fil", prop);
        messHTML.sendBtn.disabled = len == 0 || len > maxMessLen;
    }

    export function messageHeight() {
        let len = input.value.split("\n").length - 1;
        len = len >= 2 ? Math.min(len, 20) : 0;
        input.style.setProperty("--messHeight", len + "rem");
    }

    export function hideFromMessageInfo() {
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
    }

    export function colorRole() {
        const messages = document.querySelectorAll(".mess_message") as NodeListOf<HTMLElement>;
        const roles = vars.realm.roles;
        const users = vars.realm.users;
        const userColor = new Map();

        messages.forEach(mess => {
            const author = mess.querySelector(".mess_meta").getAttribute("_author");

            if (userColor.has(author)) {
                colorRoleMess(mess, userColor.get(author));
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
                    colorRoleMess(mess, color);
                    return;
                }
            }
            colorRoleMess(mess, "");
        });
    }

    export async function styleMessReacts(reactsDiv: HTMLElement) {
        const spans = reactsDiv.querySelectorAll("span");
        for (const span of spans) {
            const users = span.getAttribute("_users").split(",");

            if (users.length == 0 || users[0] == "") {
                span.remove();
                return;
            }

            span.classList.remove("userReacted");
            if (users.includes(vars.user._id)) {
                span.classList.add("userReacted");
            }

            span.title = (await Promise.all(users.map(u => apis.www.changeUserID(u)))).join(", ");
            span.innerHTML = span.getAttribute("_key") + " " + users.length;
        }
    }

    export function setSelectionStart(position: number | undefined = undefined) {
        if (!position) position = input.value.length;
        input.setSelectionRange(position, position);
    }
}

function colorRoleMess(mess: HTMLElement, color: string) {
    mess.querySelector<HTMLElement>(".mess_author_name").style.color = color;
}

setTimeout(() => {
    messStyle.sendBtnStyle();
    messStyle.messageHeight();
}, 100); // Delay of 100ms to accommodate any cached input values in the browser