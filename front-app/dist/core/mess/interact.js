import hub from "../../hub.js";
hub("mess/interact");
import messFunc from "./mess.js";
import messStyle from "./style.js";
import vars from "../../var/var.js";
import apis from "../../api/apis.js";
import coreFunc from "../coreFunc.js";
import socket from "../socket/socket.js";
import uiFunc from "../../ui/helpers/uiFunc.js";
import messCmd, { messCmds, setCurrentCmd } from "./cmd.js";
import { emojiHTML, messHTML } from "../../var/html.js";
import { mglInt } from "../../var/mgl.js";
import emojiFunc, { customEmoji } from "../../ui/components/emoji.js";
import LangPkg from "../../utils/translate.js";
const messInteract = {
    replyClose() {
        messHTML.replyClose.style.display = "none";
        if (vars.temp.replyId)
            document.querySelector("#mess__" + vars.temp.replyId).style.backgroundColor = "";
        vars.temp.replyId = null;
    },
    editMessClose() {
        messHTML.editClose.style.display = "none";
        messHTML.input.value = "";
        vars.temp.editId = null;
        coreFunc.focusInp();
        messStyle.sendBtnStyle();
        messStyle.messageHeight();
        messStyle.setSelectionStart();
    },
    linkClick(e) {
        e.preventDefault();
        let url = e.target.getAttribute("href");
        if (!url)
            return;
        if (!/^(https?:\/\/)/i.test(url))
            url = "http://" + url;
        const urlParts = url.split("/");
        if (urlParts.length < 2)
            return uiFunc.uiMsgT(LangPkg.ui.message.invalid_link);
        const urlColored = urlParts[0] + "//" +
            "<span>" + urlParts[2] + "</span>" +
            "/" + urlParts.slice(3).join("/");
        const end = () => {
            messHTML.linkClick.fadeOut();
            messHTML.linkClick.querySelector("#linkClick_yes").removeEventListener("click", handleYesClick);
            messHTML.linkClick.querySelector("#linkClick_no").removeEventListener("click", end);
        };
        const handleYesClick = () => {
            window.open(url, "_blank");
            end();
        };
        messHTML.linkClick.fadeIn();
        messHTML.linkClick.querySelector("#linkClick_link").innerHTML = urlColored;
        messHTML.linkClick.querySelector("#linkClick_yes").addEventListener("click", handleYesClick);
        messHTML.linkClick.querySelector("#linkClick_no").addEventListener("click", end);
    },
    emocjiPopup(cb) {
        emojiHTML.div.fadeIn();
        function evt(e) {
            cb(e.detail);
            emojiHTML.div.removeEventListener("emocji", evt);
            emojiHTML.div.fadeOut();
            setTimeout(() => {
                coreFunc.focusInp();
                messStyle.setSelectionStart();
            }, 100);
        }
        setTimeout(() => {
            emojiHTML.div.addEventListener("emocji", evt);
            emojiHTML.input.value = "";
            emojiFunc.renderEmoji();
            const to = vars.chat.to;
            if (to == "main" || to.startsWith("$"))
                return;
            socket.emit("realm.emojis.sync", to, (emojis) => {
                customEmoji.categories = [{
                        id: "Custom",
                        emojis: [
                            ...emojis.map(emoji => emoji.name)
                        ]
                    }];
                customEmoji.emojis = {};
                emojis.forEach(emoji => {
                    customEmoji.emojis[emoji.name] = {
                        id: emoji.emoji,
                        name: emoji.name,
                        keywords: [emoji.name],
                        skins: [],
                        html: true
                    };
                });
                emojiFunc.renderEmoji();
            });
        }, 100);
    },
    emocji() {
        messInteract.emocjiPopup((emoticon) => {
            messInteract.handleEmocji(emoticon);
            setTimeout(() => {
                messStyle.setSelectionStart();
            }, 100);
        });
    },
    handleEmocji(emoji) {
        if (!emoji)
            return;
        messHTML.input.value += emoji;
    },
    search() {
        messHTML.input.value = "/search ";
        setCurrentCmd(messCmds.system.search);
        const evt = new Event("input");
        messHTML.input.dispatchEvent(evt);
        messCmd.handleCommandInput();
    },
    displayPinned() {
        messHTML.div.innerHTML = "<h2>" + LangPkg.ui.pinned_messages + "</h2>";
        if (vars.chat.pinned.length == 0) {
            messHTML.div.innerHTML += LangPkg.ui.no_pinned_messages;
            return;
        }
        vars.chat.pinned.forEach((m) => {
            messFunc.addMess(m);
        });
    },
    spoiler(e) {
        e.preventDefault();
        const t = e.target;
        t.clT("spoiler__show");
    },
    thread(thread, messDiv) {
        if (!thread)
            return;
        if (!messDiv)
            return;
        const { _id, name, author } = thread;
        if (messDiv.querySelector("#thread__" + _id))
            return;
        const div = document.createElement("div");
        div.classList.add("thread");
        div.id = "thread__" + _id;
        div.innerHTML = `
            \`- <span class="thread__author">${apis.www.changeUserID(author)}</span> |  
            <span class="thread__name">${name}</span>`;
        div.addEventListener("click", () => {
            coreFunc.changeChnl("&" + _id);
        });
        messDiv.add(div);
    }
};
messInteract.replyClose();
export default messInteract;
mglInt.mess = messInteract;
//# sourceMappingURL=interact.js.map