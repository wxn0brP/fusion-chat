import hub from "../../hub.js";
hub("mess/interact");

import { emojiHTML, messHTML, mglInt } from "../../var/html.js";
import vars from "../../var/var.js";
import messCmd, { messCmds } from "./cmd.js";
import coreFunc from "../../core/coreFunc.js";
import uiFunc from "../../ui/helpers/uiFunc.js";
import apis from "../../api/apis.js";
import socket from "../socket/socket.js";
import translateFunc from "../../utils/translate.js";
import emojiFunc from "../../ui/components/emoji.js";
import messFunc from "./mess.js";
import messStyle from "./style.js";

const messInteract = {
    replyClose(){
        messHTML.replyClose.style.display = "none";
        if(vars.temp.replyId) document.querySelector("#mess__"+vars.temp.replyId).style.backgroundColor = "";
        vars.temp.replyId = null;
    },

    editMessClose(){
        messHTML.editClose.style.display = "none";
        messHTML.input.value = "";
        vars.temp.editId = null;
        coreFunc.focusInp();
    },

    linkClick(e){
        e.preventDefault();
        let url = e.target.getAttribute("href");
        if(!url) return;

        if(!/^(https?:\/\/)/i.test(url)) url = "http://" + url;

        const urlParts = url.split("/");
        if(urlParts.length < 2) return uiFunc.uiMsg(translateFunc.get("Invalid link") + ".");
        const urlClored =
            urlParts[0] + "//" +
            "<span>" + urlParts[2] + "</span>" +
            "/" + urlParts.slice(3).join("/")
        
        const end = () => {
            messHTML.linkClick.fadeOut();
            messHTML.linkClick.querySelector("#linkClick_yes").removeEventListener("click", handleYesClick);
            messHTML.linkClick.querySelector("#linkClick_no").removeEventListener("click", end);
        }
        const handleYesClick = () => {
            window.open(url, "_blank");
            end();
        }
        messHTML.linkClick.fadeIn();
        messHTML.linkClick.querySelector("#linkClick_link").innerHTML = urlClored;
        messHTML.linkClick.querySelector("#linkClick_yes").addEventListener("click", handleYesClick);
        messHTML.linkClick.querySelector("#linkClick_no").addEventListener("click", end);
    },

    emocjiPopup(cb){
        emojiHTML.div.fadeIn();
        function evt(e){
            cb(e.detail);
            emojiHTML.div.removeEventListener("emocji", evt);
            emojiHTML.div.fadeOut();
        }
        setTimeout(() => {
            emojiHTML.div.addEventListener("emocji", evt);
            emojiHTML.input.value = "";
            emojiFunc.renderEmoji();

            const to = vars.chat.to;
            if(to == "main" || to.startsWith("$")) return;
            socket.emit("realm.emojis.sync", to, (emojis) => {
                emojiFunc.customEmojisCat = [{
                    id: "Custom",
                    emojis: [
                        ...emojis.map(emoji => emoji.name)
                    ]
                }];
    
                emojiFunc.customEmojis = {}
                emojis.forEach(emoji => {
                    emojiFunc.customEmojis[emoji.name] = {
                        id: emoji.name,
                        name: emoji.name,
                        keywords: [emoji.name],
                        skins: [
                            {
                                native: String.fromCharCode(emoji.unicode),
                            }
                        ]
                    }
                });
    
                emojiFunc.renderEmoji();
            });
        }, 100);
    },

    emocji(){
        const _this = this;
        _this.emocjiPopup((emoticon) => {
            _this.handleEmocji(emoticon);
            setTimeout(() => {
                messStyle.setSelectionStart();
            }, 100);
        });
    },

    handleEmocji(e){
        if(!e) return;
        messHTML.input.value += e;
    },

    search(){
        messHTML.input.value = "/search ";
        messCmd.selectedCmd = messCmds.system.search;

        const evt = new Event("input");
        messHTML.inputRaw.dispatchEvent(evt);

        messCmd.handleCommandInput(
            barc__commads,
            "search",
            messCmd.selectedCmd
        );
    },

    displayPinned(){
        messHTML.div.innerHTML = "<h2>" + translateFunc.get("Pinned messages") + "</h2>";
        if(vars.chat.pinned.length == 0){
            messHTML.div.innerHTML += translateFunc.get("No pinned messages");
            return;
        }
        vars.chat.pinned.forEach((m) => {
            messFunc.addMess(m);
        });
    },

    spoiler(e){
        e.preventDefault();
        const t = e.target;
        t.classList.toggle("spoiler__show");
    },

    thread(thread, messDiv){
        if(!thread) return;
        const { _id, name, author } = thread;

        const div = document.createElement("div");
        div.classList.add("thread");
        div.id = "thread__"+_id;
        div.innerHTML = `
            |- <span class="thread__author">${apis.www.changeUserID(author)}</span> |  
            <span class="thread__name">${name}</span>`;
        div.addEventListener("click", () => {
            coreFunc.changeChnl("&"+_id);
        });
        messDiv.add(div);
    }
}

messInteract.replyClose();
export default messInteract;
mglInt.mess = messInteract;