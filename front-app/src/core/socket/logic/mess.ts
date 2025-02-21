import hub from "../../../hub";
hub("socket/mess");

import socket from "../socket";
import Id from "../../../types/Id";
import vars from "../../../var/var";
import apis from "../../../api/apis";
import coreFunc from "../../coreFunc";
import utils from "../../../utils/utils";
import messStyle from "../../mess/style";
import formatFunc from "../../mess/format";
import { messHTML } from "../../../var/html";
import render_dm from "../../../ui/render/dm";
import messInteract from "../../mess/interact";
import uiFunc from "../../../ui/helpers/uiFunc";
import messFunc, { editMessText } from "../../mess/mess";
import contextMenu from "../../../ui/components/contextMenu";
import { Vars_mess__pinned, Vars_realm__thread } from "../../../types/var";
import { Core_mess__dbMessage, Core_mess__receivedMessage } from "../../../types/core/mess";
import LangPkg, { langFunc } from "../../../utils/translate";
import apiVars from "../../../var/api";
import messageCacheController from "../../cacheControllers/mess";

export function mess(data: Core_mess__receivedMessage) {
    // generate last message storage if needed
    apiVars.lastMess[data.to] = apiVars.lastMess[data.to] || {};
    apiVars.lastMess[data.to][data.chnl] = apiVars.lastMess[data.to][data.chnl] || { read: null, mess: null };

    // update last message
    apiVars.lastMess[data.to][data.chnl].mess = data._id;

    messageCacheController.addMessage(data.to, data.chnl, convertReceivedMessageToDbMessage(data));

    const isPrivateChat = data.to.startsWith("$");
    const currentChatIsDM = vars.chat.to.startsWith("$");
    const isSenderCurrentUser = data.fr === vars.user._id;

    if (isPrivateChat && !currentChatIsDM && !isSenderCurrentUser) {
        const title = langFunc(LangPkg.ui.new_message, apis.www.changeUserID(data.fr));
        uiFunc.uiMsg(title);

        if (
            vars.settings.notifications &&
            vars.user.status !== "dnd"
        ) utils.sendNotification(title, data.msg, { msg: data });
    }
    if (isPrivateChat) render_dm.chats();

    // end if not in chat
    if (vars.chat.to !== data.to || vars.chat.chnl !== data.chnl) return;

    // update last message read
    apiVars.lastMess[data.to][data.chnl].read = data._id;
    if (isPrivateChat) render_dm.privsRead();

    // add message to chat
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

function convertReceivedMessageToDbMessage(data: Core_mess__receivedMessage): Core_mess__dbMessage {
    const mess: Core_mess__dbMessage = {
        _id: data._id,
        fr: data.fr,
        msg: data.msg,
    }

    if (data.embed) mess.embed = data.embed;
    if (data.res) mess.res = data.res;

    return mess;
}

export function message_fetch(data: Core_mess__dbMessage[]) {
    try {
        data.forEach((mess) => {
            try {
                messFunc.addMess(mess, false, true);
            } catch (e) {
                console.error(e);
                console.error(mess);
                const div = document.createElement("div");
                div.innerHTML = `<span style="color: red;">${LangPkg.ui.failed_to_load_message}!</span>`;
                messHTML.div.add(div);
            }
        });
        messStyle.hideFromMessageInfo();
        setTimeout(coreFunc.scrollToBottom, 30);
    } catch (e) {
        console.error(e);
        const div = document.createElement("div");
        div.innerHTML = `<span style="color: red;">${LangPkg.ui.failed_to_load_messages}! :(</span>`;
        messHTML.div.add(div);
    }
    messStyle.colorRole();
}

export function message_delete(id: Id, chatId: Id) {
    document.querySelector("#mess__" + id)?.remove();
    messStyle.hideFromMessageInfo();
    messageCacheController.deleteMessage(chatId, id);
}

export function messages_delete(ids: Id[], chatId: Id) {
    ids.forEach(id => {
        document.querySelector("#mess__" + id)?.remove();
    })
    messStyle.hideFromMessageInfo();
    messageCacheController.deleteMessages(chatId, ids);
}

export function message_edit(id: Id, msg: string, time: string, chatId: Id) {
    const messageDiv = document.querySelector("#mess__" + id + " .mess_content") as HTMLDivElement;
    if (!messageDiv) return;
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

export function message_react(uid: Id, realm: Id, messId: Id, react: string) {
    if (vars.chat.to != realm) return;

    const mess = document.querySelector("#mess__" + messId);
    if (!mess) return;

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
    } else {
        users.push(uid);
    }

    reactSpan.setAttribute("_users", users.join(","));
    messStyle.styleMessReacts(mess.querySelector(".mess_reacts"));
}

export function message_search(data: Core_mess__dbMessage[]) {
    if (data.length == 0) {
        messHTML.div.innerHTML += LangPkg.ui.message.search_no_results;
        return;
    }
    messHTML.div.innerHTML = "<h2>" + LangPkg.ui.message.search_results + ":</h2>";

    data.forEach((mess) => {
        messFunc.addMess(mess, false);
    });
}

export function message_fetch_pinned(data: Vars_mess__pinned[]) {
    vars.chat.pinned = data;
}

export function realm_thread_list(data: Vars_realm__thread[]) {
    vars.realm.threads = [
        ...new Set(
            [...vars.realm.threads, ...data]
        )
    ];

    data.forEach(t => {
        const chnlDiv = document.querySelector("#channel_" + t.thread);
        if (!chnlDiv) return;

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
            })
        }

        if (t.reply) {
            const mess = document.querySelector<HTMLDivElement>("#mess__" + t.reply);
            if (mess) messInteract.thread(t, mess);
        }
    })
}

export function realm_thread_delete(id: Id) {
    document.querySelector("#channel_\\&" + id)?.remove();
    document.querySelector("#thread__" + id)?.remove();
}