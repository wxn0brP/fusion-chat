import hub from "../../hub";
hub("render/realmInit");

import Id from "../../types/Id";
import vars from "../../var/var";
import { renderState } from "./var";
import uiFunc from "../helpers/uiFunc";
import coreFunc from "../../core/coreFunc";
import voiceFunc from "../components/voice";
import { Channel_Type } from "../../types/channel";
import { navHTML } from "../../var/html";
import contextMenu from "../components/contextMenu";
import { Ui_render__category, Ui_render__channel } from "../../types/ui/render";
import LangPkg from "../../utils/translate";
import socket from "../../core/socket/socket";
import render_events from "./event";
import { socketEvt } from "../../core/socket/engine";

function initRealmState(permission: number = 0) {
    vars.realm = {
        users: [],
        roles: [],
        permission: permission,
        text: [],
        desc: {},
        chnlPerms: {},
        threads: []
    };
}

function createRealmNameSection(name: string, sid: Id) {
    navHTML.realm__name.innerHTML = "";

    const nameText = document.createElement("div");
    nameText.innerHTML = name;
    nameText.title = name;
    nameText.id = "navs__realm__name__text";
    navHTML.realm__name.appendChild(nameText);

    addUsersDisplayButton();
    addMenuButton(sid);
}

function addUsersDisplayButton() {
    const usersDisplayBtn = document.createElement("span");
    usersDisplayBtn.innerHTML = "👥";
    usersDisplayBtn.classList.add("realm_nav_btn");
    usersDisplayBtn.addEventListener("click", toggleUserDisplay);
    navHTML.realm__name.appendChild(usersDisplayBtn);
}

function toggleUserDisplay() {
    renderState.chnl_user = !renderState.chnl_user;
    navHTML.realm__channels.style.display = renderState.chnl_user ? "none" : "";
    navHTML.realm__users.style.display = renderState.chnl_user ? "" : "none";
}

function addMenuButton(sid: Id) {
    const menuBtn = document.createElement("span");
    menuBtn.classList.add("realm_nav_btn");
    menuBtn.innerHTML = "⬇️";
    menuBtn.addEventListener("click", (e) => {
        setTimeout(() => {
            contextMenu.realm(e, sid);
        }, 20); // wait for click event end
    });
    navHTML.realm__name.appendChild(menuBtn);
}

function createChannel(channel: Ui_render__channel, root: HTMLElement, sid: Id) {
    const { name, type, desc, id: cid } = channel;
    const btn = document.createElement("div");

    btn.onclick = () => handleChannelClick(type, cid, sid);
    btn.id = "channel_" + cid;
    btn.classList.add("channel_" + type);

    contextMenu.menuClickEvent(btn, (e) => {
        contextMenu.channel(e, cid, { type });
    });

    const typeEmoticon = getChannelTypeEmoticon(type);
    btn.innerHTML = `${typeEmoticon} | ${name}`;
    root.appendChild(btn);
    vars.realm.desc[cid] = desc;
}

export function getChannelTypeEmoticon(type: Channel_Type) {
    switch (type) {
        case "text": return "📝";
        case "voice": return "🎤";
        case "announcement": return "📣";
        case "open_announcement": return "📣";
        case "forum": return "📜";
        default:
            const n: never = type;
            console.error(n);
    }
}

function handleChannelClick(type: Channel_Type, cid: Id, sid: Id) {
    if (type === "text" || type === "announcement" || type === "open_announcement") {
        coreFunc.changeChnl(cid);
    } else if (type === "voice") {
        handleVoiceChannelJoin(cid, sid);
    } else if (type === "forum") {
        coreFunc.changeToForum(cid);
    }
}

function handleVoiceChannelJoin(cid: Id, sid: Id) {
    const chnl = vars.realm.chnlPerms[cid];
    if (!chnl || !chnl.write) {
        uiFunc.uiMsgT(LangPkg.ui.channel.no_permission, ["!"]);
        return;
    }
    voiceFunc.joinToVoiceChannel(sid + "=" + cid);
}

function createCategory(category: Ui_render__category, root: HTMLElement, sid: Id) {
    const detail = document.createElement("details");
    detail.open = true;

    const summary = document.createElement("summary");
    summary.innerHTML = category.name;
    detail.appendChild(summary);

    category.chnls.forEach(channel => {
        createChannel(channel, detail, sid);
        vars.realm.chnlPerms[channel.id] = channel.perms;
    });

    root.appendChild(detail);
}

function findFirstTextChannel(categories: Ui_render__category[]) {
    for (const cat of categories) {
        const textChannel = cat.chnls.find(chnl => chnl.type === "text");
        if (textChannel) return textChannel.id;
    }
    return null;
}

function downPanel() {
    const downPanel = navHTML.realm__panel;
    downPanel.innerHTML = "";
    downPanel_events(downPanel);

}

function downPanel_events(panel: HTMLElement) {
    const events = document.createElement("button");
    events.innerHTML = "🪇";
    events.title = "Events";
    events.id = "navs__realm__events";
    events.clA("btn");
    events.addEventListener("click", render_events.show);
    panel.appendChild(events);

    socket.emit("realm.event.list", vars.chat.to, true, (len: number) => {
        events.setAttribute("data-count", len.toString());
    });
}

function realmInit(sid: Id, name: string, categories: Ui_render__category[], permission: number) {
    initRealmState(permission);
    createRealmNameSection(name, sid);

    navHTML.realm__channels.innerHTML = "";
    if (categories.length === 0 || categories.every(category => category.chnls.length === 0)) {
        navHTML.realm__channels.innerHTML = "No channels in this realm";
        vars.chat.chnl = null;
        return;
    }

    categories.forEach(category => createCategory(category, navHTML.realm__channels, sid));

    downPanel();

    if (vars.chat.chnl === null)
        vars.chat.chnl = findFirstTextChannel(categories);

    coreFunc.changeChnl(vars.chat.chnl);

    socketEvt["realm.thread.list"].emitId(sid + "=null", sid, null);
}

export default realmInit;