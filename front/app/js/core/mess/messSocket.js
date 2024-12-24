import hub from "../../hub.js";
hub("messSocket");

import { messHTML } from "../../var/html.js";
import vars from "../../var/var.js";
import messFunc, { editMessText} from "./mess.js";
import messStyle from "./messStyle.js";
import uiFunc from "../../ui/helpers/uiFunc.js";
import socket from "../socket/ws.js";
import apis from "../../api/apis.js";
import contextMenu from "../../ui/components/contextMenu.js";
import coreFunc from "../coreFunc.js";
import formatFunc from "./format.js";
import translateFunc from "../../utils/translate.js";
import utils from "../../utils/utils.js";

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

socket.on("mess", (data) => {
    // generate last message storage if needed
    vars.lastMess[data.to] = vars.lastMess[data.to] || {};
    vars.lastMess[data.to][data.chnl] = vars.lastMess[data.to][data.chnl] || { read: null, mess: null };

    // update last message
    vars.lastMess[data.to][data.chnl].mess = data._id;

    const isPrivateChat = data.to.startsWith("$");
    const currentChatIsDM = vars.chat.to.startsWith("$");
    const isSenderCurrentUser = data.fr === vars.user._id;

    if(isPrivateChat && !currentChatIsDM && !isSenderCurrentUser){
        const title = translateFunc.get("Received message from $", apis.www.changeUserID(data.fr));
        uiFunc.uiMsg(title);

        if(vars.settings.notifications) utils.sendNotification(title, data.msg, { msg: data });
    }
    if(isPrivateChat) renderFunc.privs();

    // end if not in chat
    if(vars.chat.to !== data.to || vars.chat.chnl !== data.chnl) return;

    // update last message read
    vars.lastMess[data.to][data.chnl].read = data._id;
    if(isPrivateChat) renderFunc.privsRead();

    // add message to chat
    messFunc.addMess(data);
    messStyle.hideFromMessageInfo();
    messStyle.colorRole();

    setTimeout(() => {
        const lastMessageId = vars.lastMess[data.to][data.chnl].mess;
        if(lastMessageId === data._id){
            socket.emit("message.markAsRead", data.to, data.chnl, data._id);
        }
    }, 1000);
});

socket.on("message.fetch", (data) => {
    try{
        data.forEach((mess) => {
            try{
                mess.e = mess.lastEdit ? mess.lastEdit : false;
                mess.reacts = mess.reacts || {};
                messFunc.addMess(mess, false, true);
            }catch(e){
                lo(e);
                lo(mess);
                const div = document.createElement("div");
                div.innerHTML = `<span style="color: red;">Failed to load this message!</span>`;
                messHTML.div.add(div);
            }
        });
        messStyle.hideFromMessageInfo();
        setTimeout(coreFunc.socrollToBottom, 30);
    }catch(e){
        lo(e);
        const div = document.createElement("div");
        div.innerHTML = `<span style="color: red;">"Failed to load the message! :("</span>`;
        messHTML.div.add(div);
    }
    messStyle.colorRole();
});

socket.on("message.delete", (id) => {
    document.querySelector("#mess__"+id)?.remove();
    messStyle.hideFromMessageInfo();
});

socket.on("messages.delete", (ids) => {
    ids.forEach(id => {
        document.querySelector("#mess__"+id)?.remove();
    })
    messStyle.hideFromMessageInfo();
});

socket.on("message.edit", (id, msg, time) => {
    const messageDiv = document.querySelector("#mess__"+id+" .mess_content");
    if(!messageDiv) return;
    messageDiv.setAttribute("_plain", msg);
    formatFunc.formatMess(msg, messageDiv);
    messageDiv.innerHTML += editMessText.replace("$$", utils.formatDateFormUnux(parseInt(time, 36)));

    const responeMessages = document.querySelectorAll(`[resMsgID=${id}] .res_msg`);
    responeMessages.forEach(mess => {
        mess.innerHTML = msg;
    });
    messStyle.hideFromMessageInfo();
});

socket.on("message.react", (uid, server, messId, react) => {
    if(vars.chat.to != server) return;
    
    const mess = document.querySelector("#mess__"+messId);
    if(!mess) return;

    const reactSpan = mess.querySelector(`span[_key="${react}"]`);
    if(!reactSpan){
        const span = document.createElement("span");
        span.setAttribute("_key", react);
        span.setAttribute("_users", uid);
        span.innerHTML = react + " 1";
        span.title = apis.www.changeUserID(uid);
        span.addEventListener("click", () => {
            socket.emit("message.react", server, messId, react);
        });
        mess.querySelector(".mess_reacts").appendChild(span);
        messStyle.styleMessReacts(mess.querySelector(".mess_reacts"));
        return;
    }

    let users = reactSpan.getAttribute("_users").split(",");
    if(users.includes(uid)){
        users = users.filter(u => u != uid);
    }else{
        users.push(uid);
    }

    reactSpan.setAttribute("_users", users.join(","));
    messStyle.styleMessReacts(mess.querySelector(".mess_reacts"));
});

socket.on("message.search", (data) => {
    if(data.length == 0){
        messHTML.div.innerHTML += "No result found";
        return;
    }
    messHTML.div.innerHTML = "<h2>"+translateFunc.get("Search result")+":</h2>";

    data.forEach((mess) => {
        messFunc.addMess(mess, false);
    });
});

socket.on("message.fetch.pinned", (data) => {
    vars.chat.pinned = data;
});

socket.on("realm.thread.list", (data) => {
    vars.realm.threads = data;
    const chnlDiv = document.querySelector("#channel_"+vars.chat.chnl);
    if(!chnlDiv) return;

    data.forEach(t => {
        const exitsts = document.querySelector("#channel_\\&"+t._id);
        if(!exitsts){
            const div = document.createElement("div");
            div.classList.add("channel_text");
            div.id = "channel_&"+t._id;
            div.style.paddingLeft = "2.4rem";
            div.innerHTML = `|- ${t.name}`;
            div.addEventListener("click", () => {
                coreFunc.changeChnl("&"+t._id);
            });
            chnlDiv.insertAdjacentElement("afterend", div);
            contextMenu.menuClickEvent(div, (e) => {
                contextMenu.thread(e, t);
            })
        }

        if(t.reply){
            const mess = document.querySelector("#mess__"+t.reply);
            messFunc.thread(t, mess);
        }
    })
});

socket.on("realm.thread.delete", (id) => {
    document.querySelector("#channel_\\&"+id)?.remove();
    document.querySelector("#thread__"+id)?.remove();
});