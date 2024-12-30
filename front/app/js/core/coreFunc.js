import hub from "../hub.js";
hub("coreFunc");

import vars from "../var/var.js";
import apis from "../api/apis.js";
import utils from "../utils/utils.js";
import socket from "./socket/socket.js";
import emojiFunc from "../ui/components/emoji.js";
import mainView from "../ui/components/mainView.js";
import translateFunc from "../utils/translate.js";

import { navHTML, coreHTML, messHTML, mainViewHTML, mglVar } from "../var/html.js";
import { renderState } from "../ui/render/var.js";
import messStyle from "./mess/style.js";

const coreFunc = {
    changeChat(id, chnl=null){
        messHTML.div.innerHTML = "";
        coreHTML.emojiStyle.innerHTML = "";
        emojiFunc.customEmojisCat = [];
        emojiFunc.customEmojis = {};

        if(id == "main"){
            vars.chat.to = "main";
            messHTML.bar.style.display = "none";
            document.querySelector("title").innerHTML = vars.baseTitle;

            navHTML.main.style.display = "block";
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
            if(!utils.ss()) return;
            if(id != "main" && !id.startsWith("$")) return;
            document.querySelector("nav").style.left = "-360px";
        }, 300);

        messHTML.bar.style.display = "block";
        messHTML.div.style.display = "";
        messHTML.nav.style.display = "";
        mainViewHTML.div.style.display = "none";
        vars.chat.to = id;
        vars.chat.actMess = 0;

        if(id.startsWith("$")){
            document.querySelector("title").innerHTML = vars.baseTitle + " | " + apis.www.changeUserID(id.substring(1));
            navHTML.main.style.display = "block";
            navHTML.realms.style.display = "none";
            vars.chat.chnl = "main";
            coreFunc.loadChat();
            socket.emit("message.fetch.pinned", vars.chat.to, vars.chat.chnl);
            vars.realm.users = [];
            vars.realm.roles = [];
            vars.realm.chnlPerms = {};
            messHTML.input.placeholder = translateFunc.get("Write message here") + "...";
            messHTML.input.disabled = false;
            navHTML.main__call.style.display = "";
            messHTML.nav_priv.style.display = "";
            messHTML.nav_realm.style.display = "none";
        }else{
            document.querySelector("title").innerHTML = vars.baseTitle + " | " + apis.www.changeChat(id);
            navHTML.main.style.display = "none";
            navHTML.realms.style.display = "block";
            messHTML.nav_priv.style.display = "none";
            messHTML.nav_realm.style.display = "";
            vars.chat.chnl = chnl;
            renderState.chnl_user = false;
            navHTML.realms__channels.style.display = "";
            navHTML.realms__users.style.display = "none";
            socket.emit("realm.setup", id);
            socket.emit("realm.users.sync", id);
            if(chnl) socket.emit("realm.thread.list", id, chnl);
        }
        coreFunc.markSelectedChat();
    },

    changeChnl(id){
        vars.chat.chnl = id;
        vars.chat.actMess = 0;

        document.querySelectorAll(".channel_textActive").forEach(e => e.classList.remove("channel_textActive"));
        document.querySelector("#channel_"+utils.escape(id))?.classList?.add("channel_textActive");
        messages_nav__realm__description.innerHTML = vars.realm.desc[id] || "";
        
        coreFunc.loadChat();
        socket.emit("message.fetch.pinned", vars.chat.to, vars.chat.chnl);
        if(!id.startsWith("&")){
            setTimeout(() => {
                socket.emit("realm.thread.list", vars.chat.to, vars.chat.chnl);
            }, 100); // wait for load chat
        }

        let permToWrite = false;
        if(id.startsWith("&")){
            const tid = id.substring(1);
            const thread = vars.realm.threads.find(t => t._id == tid);
            if(thread){
                const chnl = vars.realm.chnlPerms[thread.thread];
                permToWrite = chnl.threadWrite;
            }
        }else{
            const chnl = vars.realm.chnlPerms[id];
            if(chnl){
                permToWrite = chnl.write;
            }
        }

        if(permToWrite){
            messHTML.input.placeholder = translateFunc.get("Write message here") + "...";
            messHTML.input.disabled = false;
        }else{
            messHTML.input.placeholder = translateFunc.get("You can't write in this channel") + "!";
            messHTML.input.disabled = true;
        }
    },

    loadChat(){
        coreFunc.loadMess();
        setTimeout(coreFunc.focusInp, 100);
        setTimeout(() => {
            messHTML.div.scrollTop = messHTML.div.scrollHeight;
        }, 300);
    },

    focusInp(end=false){
        if(utils.ss()) return;
        setTimeout(() => {
            messHTML.inputRaw.focus();
            // move cursor to end
            if(end) messStyle.setSelectionStart();
        }, 100);
    },

    loadMess(){
        messHTML.div.innerHTML = "";
        const tmp = vars.chat.actMess;
        vars.chat.actMess += vars.messCount;
        if(vars.chat.to == "main") return;

        socket.emit("message.fetch", vars.chat.to, vars.chat.chnl, tmp, vars.chat.actMess);
        socket.emit("message.markAsRead", vars.chat.to, vars.chat.chnl, "last");
    },

    socrollToBottom(){
        if(vars.temp.socrollBlock) return;
        vars.temp.socrollBlock = true;
        setTimeout(() => {
            messHTML.div.scrollTop = messHTML.div.scrollHeight;
        }, 50);
        setTimeout(() => {
            vars.temp.socrollBlock = false;
        }, 300);
    },

    markSelectedChat(){
        document.querySelectorAll(".priv_chat").forEach((ele) => {
            ele.classList.remove("priv_chatActive")
        });
        document.querySelectorAll(".realm").forEach((ele) => {
            ele.classList.remove("realm_chatActive")
        });

        const to = vars.chat.to;
        if(to == "main"){}
        else if(to.startsWith("$")) document.querySelector("#priv_chat_"+to.substring(1)).classList.add("priv_chatActive");
        else document.querySelector("#realm_chat_"+to).classList.add("realm_chatActive");
    },

}

export default coreFunc;
mglVar.coreFunc = coreFunc;