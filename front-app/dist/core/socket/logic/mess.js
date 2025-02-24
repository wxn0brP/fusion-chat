import hub from "../../../hub.js";
hub("socket/mess");
import socket from "../socket.js";
import vars from "../../../var/var.js";
import apis from "../../../api/apis.js";
import coreFunc from "../../coreFunc.js";
import utils from "../../../utils/utils.js";
import messStyle from "../../mess/style.js";
import formatFunc from "../../mess/format.js";
import { messHTML } from "../../../var/html.js";
import render_dm from "../../../ui/render/dm.js";
import messInteract from "../../mess/interact.js";
import uiFunc from "../../../ui/helpers/uiFunc.js";
import messFunc, { editMessText } from "../../mess/mess.js";
import contextMenu from "../../../ui/components/contextMenu.js";
import LangPkg, { langFunc } from "../../../utils/translate.js";
import apiVars from "../../../var/api.js";
import messageCacheController from "../../cacheControllers/mess.js";
export function mess(data) {
    apiVars.lastMess[data.to] = apiVars.lastMess[data.to] || {};
    apiVars.lastMess[data.to][data.chnl] = apiVars.lastMess[data.to][data.chnl] || { read: null, mess: null };
    apiVars.lastMess[data.to][data.chnl].mess = data._id;
    messageCacheController.addMessage(data.to, data.chnl, convertReceivedMessageToDbMessage(data));
    const isPrivateChat = data.to.startsWith("$");
    const currentChatIsDM = vars.chat.to.startsWith("$");
    const isSenderCurrentUser = data.fr === vars.user._id;
    if (isPrivateChat && !currentChatIsDM && !isSenderCurrentUser) {
        const title = langFunc(LangPkg.ui.new_message, apis.www.changeUserID(data.fr));
        uiFunc.uiMsg(title);
        if (vars.settings.notifications &&
            vars.user.status !== "dnd")
            utils.sendNotification(title, data.msg, { msg: data });
    }
    if (isPrivateChat)
        render_dm.chats();
    if (vars.chat.to !== data.to || vars.chat.chnl !== data.chnl)
        return;
    apiVars.lastMess[data.to][data.chnl].read = data._id;
    if (isPrivateChat)
        render_dm.privsRead();
    messFunc.addMess(convertReceivedMessageToDbMessage(data));
    messStyle.hideFromMessageInfo();
    messStyle.colorRole();
    setTimeout(() => {
        const lastMessageId = apiVars.lastMess[data.to][data.chnl].mess;
        if (lastMessageId === data._id) {
            socket.emit("message.mark.read", data.to, data.chnl, data._id);
        }
    }, 1000);
}
function convertReceivedMessageToDbMessage(data) {
    const mess = {
        _id: data._id,
        fr: data.fr,
        msg: data.msg,
    };
    if (data.embed)
        mess.embed = data.embed;
    if (data.res)
        mess.res = data.res;
    return mess;
}
export function message_fetch(data) {
    try {
        data.forEach((mess) => {
            try {
                messFunc.addMess(mess, false, true);
            }
            catch (e) {
                console.error(e);
                console.error(mess);
                const div = document.createElement("div");
                div.innerHTML = `<span style="color: red;">${LangPkg.ui.failed_to_load_message}!</span>`;
                messHTML.div.add(div);
            }
        });
        messStyle.hideFromMessageInfo();
        setTimeout(coreFunc.scrollToBottom, 30);
    }
    catch (e) {
        console.error(e);
        const div = document.createElement("div");
        div.innerHTML = `<span style="color: red;">${LangPkg.ui.failed_to_load_messages}! :(</span>`;
        messHTML.div.add(div);
    }
    messStyle.colorRole();
}
export function message_delete(id, chatId) {
    document.querySelector("#mess__" + id)?.remove();
    messStyle.hideFromMessageInfo();
    messageCacheController.deleteMessage(chatId, id);
}
export function messages_delete(ids, chatId) {
    ids.forEach(id => {
        document.querySelector("#mess__" + id)?.remove();
    });
    messStyle.hideFromMessageInfo();
    messageCacheController.deleteMessages(chatId, ids);
}
export function message_edit(id, msg, time, chatId) {
    const messageDiv = document.querySelector("#mess__" + id + " .mess_content");
    if (!messageDiv)
        return;
    messageDiv.setAttribute("_plain", msg);
    formatFunc.formatMess(msg, messageDiv);
    messageDiv.innerHTML += editMessText.replace("$$", utils.formatDateFormUnix(parseInt(time, 36) * 1000));
    const responeMessages = document.querySelectorAll(`[resMsgID=${id}] .res_msg`);
    responeMessages.forEach(mess => {
        mess.innerHTML = msg;
    });
    messStyle.hideFromMessageInfo();
    messageCacheController.editMessage(id, msg, time, chatId);
}
export function message_react(uid, realm, messId, react) {
    if (vars.chat.to != realm)
        return;
    const mess = document.querySelector("#mess__" + messId);
    if (!mess)
        return;
    const reactSpan = mess.querySelector(`span[_key="${react}"]`);
    if (!reactSpan) {
        const span = document.createElement("span");
        span.setAttribute("_key", react);
        span.setAttribute("_users", uid);
        span.innerHTML = react + " 1";
        span.title = apis.www.changeUserID(uid);
        span.addEventListener("click", () => {
            socket.emit("message.react", realm, messId, react);
        });
        mess.querySelector(".mess_reacts").appendChild(span);
        messStyle.styleMessReacts(mess.querySelector(".mess_reacts"));
        return;
    }
    let users = reactSpan.getAttribute("_users").split(",");
    if (users.includes(uid)) {
        users = users.filter(u => u != uid);
    }
    else {
        users.push(uid);
    }
    reactSpan.setAttribute("_users", users.join(","));
    messStyle.styleMessReacts(mess.querySelector(".mess_reacts"));
}
export function message_search(data) {
    if (data.length == 0) {
        messHTML.div.innerHTML += LangPkg.ui.message.search_no_results;
        return;
    }
    messHTML.div.innerHTML = "<h2>" + LangPkg.ui.message.search_results + ":</h2>";
    data.forEach((mess) => {
        messFunc.addMess(mess, false);
    });
}
export function message_fetch_pinned(data) {
    vars.chat.pinned = data;
}
export function realm_thread_list(data) {
    vars.realm.threads = [
        ...new Set([...vars.realm.threads, ...data])
    ];
    data.forEach(t => {
        const chnlDiv = document.querySelector("#channel_" + t.thread);
        if (!chnlDiv)
            return;
        const exists = document.querySelector("#channel_\\&" + t._id);
        if (!exists) {
            const div = document.createElement("div");
            div.classList.add("channel_text");
            div.id = "channel_&" + t._id;
            div.style.paddingLeft = "2.4rem";
            div.innerHTML = `\`- ${t.name}`;
            div.addEventListener("click", () => {
                coreFunc.changeChnl("&" + t._id);
            });
            chnlDiv.insertAdjacentElement("afterend", div);
            contextMenu.menuClickEvent(div, (e) => {
                contextMenu.thread(e, t);
            });
        }
        if (t.reply) {
            const mess = document.querySelector("#mess__" + t.reply);
            if (mess)
                messInteract.thread(t, mess);
        }
    });
}
export function realm_thread_delete(id) {
    document.querySelector("#channel_\\&" + id)?.remove();
    document.querySelector("#thread__" + id)?.remove();
}
//# sourceMappingURL=mess.js.map