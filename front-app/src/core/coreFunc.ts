import hub from "../hub";
hub("coreFunc");

import Id from "../types/Id";
import vars, { getEmptyRealmConfig } from "../var/var";
import apis from "../api/apis";
import utils from "../utils/utils";
import socket from "./socket/socket";
import messStyle from "./mess/style";
import { renderState } from "../ui/render/var";
import mainView from "../ui/components/mainView";
import { customEmoji } from "../ui/components/emoji";
import { navHTML, coreHTML, messHTML, mainViewHTML } from "../var/html";
import { mglVar } from "../var/mgl";
import staticData from "../var/staticData";
import LangPkg from "../utils/translate";
import render_dm from "../ui/render/dm";
import render_forum from "../ui/render/forum";
import { Vars_realm__thread } from "../types/var";

const coreFunc = {
    async changeChat(id: Id, chnl: Id | "main" | null = null) {
        messHTML.div.innerHTML = "";
        coreHTML.emojiStyle.innerHTML = "";
        customEmoji.categories = [];
        customEmoji.emojis = {};
        vars.realm = getEmptyRealmConfig();

        if (id == "main") {
            vars.chat.to = "main";
            messHTML.bar.style.display = "none";
            document.querySelector("title").innerHTML = staticData.baseTitle;

            navHTML.main.style.display = "";
            navHTML.realms.style.display = "none";
            navHTML.main__call.style.display = "none";
            messHTML.nav.style.display = "none";
            mainViewHTML.div.style.display = "";
            messHTML.div.style.display = "none";
            mainView.show();
            this.markSelectedChat();

            return;
        }

        setTimeout(() => {
            if (!utils.ss()) return;
            if (id != "main" && !id.startsWith("$")) return;
            document.querySelector("nav").style.left = "-360px";
        }, 300);

        messHTML.bar.style.display = "block";
        messHTML.div.style.display = "";
        messHTML.nav.style.display = "";
        mainViewHTML.div.style.display = "none";
        vars.chat.to = id;
        vars.chat.actMess = 0;

        if (id.startsWith("$")) {
            document.querySelector("title").innerHTML = staticData.baseTitle + " | " + apis.www.changeUserID(id.substring(1));
            navHTML.main.style.display = "";
            navHTML.realms.style.display = "none";
            vars.chat.chnl = "main";

            if (!vars.privs.includes(id.substring(1))) {
                const rawId = id.substring(1);
                const data = await new Promise(res => {
                    socket.emit("dm.create", rawId, () => {
                        socket.emit("dm.get", (data, blocked) => {
                            res([data, blocked]);
                        });
                    });
                })
                render_dm.dm_get(data[0], data[1]);
            }

            coreFunc.loadChat();
            socket.emit("message.fetch.pinned", vars.chat.to, vars.chat.chnl);
            vars.realm.users = [];
            vars.realm.roles = [];
            vars.realm.chnlPerms = {};
            coreFunc.dmPlaceholder(id.substring(1));
            navHTML.main__call.style.display = "";
            messHTML.nav_priv.style.display = "";
            messHTML.nav_realm.style.display = "none";
        } else {
            document.querySelector("title").innerHTML = staticData.baseTitle + " | " + apis.www.changeChat(id);
            navHTML.main.style.display = "none";
            navHTML.realms.style.display = "";
            messHTML.nav_priv.style.display = "none";
            messHTML.nav_realm.style.display = "";
            vars.chat.chnl = chnl;
            renderState.chnl_user = false;
            navHTML.realm__channels.style.display = "";
            navHTML.realm__users.style.display = "none";
            socket.emit("realm.setup", id);
            socket.emit("realm.users.sync", id);
            socket.emit("realm.users.activity.sync", id);
            if (chnl) socket.emit("realm.thread.list", id, chnl);
        }
        coreFunc.markSelectedChat();
    },

    changeChnl(id: Id) {
        vars.chat.chnl = id;
        vars.chat.actMess = 0;
        vars.chat.selectedMess = null;

        document.querySelectorAll(".channel_textActive").forEach(e => e.classList.remove("channel_textActive"));
        document.querySelector("#channel_" + utils.escape(id))?.classList?.add("channel_textActive");
        coreHTML.messages_nav__realm__description.innerHTML = vars.realm.desc[id] || "";

        coreFunc.loadChat();
        socket.emit("message.fetch.pinned", vars.chat.to, vars.chat.chnl);
        if (!id.startsWith("&")) {
            setTimeout(() => {
                socket.emit("realm.thread.list", vars.chat.to, vars.chat.chnl);
            }, 100); // wait for load chat
        }

        let permToWrite = false;
        if (id.startsWith("&")) {
            const tid = id.substring(1);
            const thread = vars.realm.threads.find(t => t._id == tid);
            if (thread) {
                const chnl = vars.realm.chnlPerms[thread.thread];
                permToWrite = chnl.threadWrite;
            }
        }
        else if (id.startsWith("^")) {
            permToWrite = vars.realm.chnlPerms[id]?.threadWrite || false;
        }
        else {
            const chnl = vars.realm.chnlPerms[id];
            if (chnl) {
                permToWrite = chnl.write;
            }
        }

        messHTML.input.placeholder = permToWrite ?
            LangPkg.ui.message.placeholder + "..." :
            LangPkg.ui.message.read_only + "!";
        messHTML.input.disabled = !permToWrite;
    },

    loadChat() {
        coreFunc.loadMess();
        setTimeout(coreFunc.focusInp, 100);
        setTimeout(() => {
            messHTML.div.scrollTop = messHTML.div.scrollHeight;
        }, 300);
    },

    focusInp(end: boolean = false) {
        if (utils.ss()) return;
        setTimeout(() => {
            messHTML.input.focus();
            // move cursor to end
            if (end) messStyle.setSelectionStart();
        }, 100);
    },

    loadMess() {
        messHTML.div.innerHTML = "";
        const tmp = vars.chat.actMess;
        vars.chat.actMess += staticData.messCount;
        if (vars.chat.to == "main") return;

        socket.emit("message.fetch", vars.chat.to, vars.chat.chnl, tmp, vars.chat.actMess);
        socket.emit("message.mark.read", vars.chat.to, vars.chat.chnl, "last");
    },

    scrollToBottom() {
        if (vars.temp.scrollBlock) return;
        vars.temp.scrollBlock = true;
        setTimeout(() => {
            messHTML.div.scrollTop = messHTML.div.scrollHeight;
        }, 50);
        setTimeout(() => {
            vars.temp.scrollBlock = false;
        }, 300);
    },

    markSelectedChat() {
        document.querySelectorAll(".priv_chat").forEach((ele) => {
            ele.classList.remove("priv_chatActive")
        });
        document.querySelectorAll(".realm").forEach((ele) => {
            ele.classList.remove("realm_chatActive")
        });

        const to = vars.chat.to;
        if (to == "main") { }
        else if (to.startsWith("$")) document.querySelector("#priv_chat_" + to.substring(1)).classList.add("priv_chatActive");
        else document.querySelector("#realm_chat_" + to).classList.add("realm_chatActive");
    },

    dmPlaceholder(id: Id) {
        function set(text: string, disabled: boolean) {
            messHTML.input.placeholder = text;
            messHTML.input.disabled = disabled;
        }

        const toBlocked = vars.blocked.some(block => block.block == id);
        if (toBlocked) return set(LangPkg.ui.message.block_placeholder.block + "!", true);

        const frBlocked = vars.blocked.some(block => block.blocked == id);
        if (frBlocked) return set(LangPkg.ui.message.block_placeholder.blocked + "!", true);

        set(LangPkg.ui.message.placeholder + "...", false);
    },

    async changeToForum(id: Id) {
        vars.chat.chnl = "";
        const forms = await new Promise(r => {
            socket.emit("realm.thread.list", vars.chat.to, id, r);
        }) as Vars_realm__thread[];
        messHTML.div.innerHTML = "";
        render_forum(forms, id);
    }
}

export default coreFunc;
mglVar.coreFunc = coreFunc;