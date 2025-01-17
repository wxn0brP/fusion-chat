import hub from "../../hub";
hub("render/realmInit");

import Id from "../../types/Id";
import vars from "../../var/var";
import { renderState } from "./var";
import uiFunc from "../helpers/uiFunc";
import coreFunc from "../../core/coreFunc";
import voiceFunc from "../components/voice";
import { Channel_Type } from "../../types/channel";
import { coreHTML, navHTML } from "../../var/html";
import contextMenu from "../components/contextMenu";
import { Ui_render__category, Ui_render__channel } from "../../types/ui/render";
import LangPkg from "../../utils/translate";

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
    navHTML.realms__name.innerHTML = "";

    const nameText = document.createElement("div");
    nameText.innerHTML = name;
    nameText.title = name;
    nameText.id = "navs__realms__name__text";
    navHTML.realms__name.appendChild(nameText);

    addUsersDisplayButton();
    addMenuButton(sid);
}

function addUsersDisplayButton() {
    const usersDisplayBtn = document.createElement("span");
    usersDisplayBtn.innerHTML = "👥";
    usersDisplayBtn.classList.add("realm_nav_btn");
    usersDisplayBtn.addEventListener("click", toggleUserDisplay);
    navHTML.realms__name.appendChild(usersDisplayBtn);
}

function toggleUserDisplay() {
    renderState.chnl_user = !renderState.chnl_user;
    navHTML.realms__channels.style.display = renderState.chnl_user ? "none" : "";
    navHTML.realms__users.style.display = renderState.chnl_user ? "" : "none";
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
    navHTML.realms__name.appendChild(menuBtn);
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

function getChannelTypeEmoticon(type: Channel_Type) {
    switch (type) {
        case "text": return "📝";
        case "voice": return "🎤";
        case "announcement": return "📣";
        case "open_announcement": return "📣";
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

function setupCustomEmoji(sid: Id) {
    coreHTML.emojiStyle.innerHTML = "";
    const emojiStyle = document.createElement("style");
    emojiStyle.innerHTML = `
        @font-face {
            font-family: 'emoji';
            src: url("/userFiles/emoji/${sid}.ttf") format("truetype");
            font-weight: normal;
            font-style: normal;
        }
        * {
            font-family: 'emoji', 'Ubuntu', sans-serif;
        }
    `;
    coreHTML.emojiStyle.appendChild(emojiStyle);
}

function findFirstTextChannel(categories: Ui_render__category[]) {
    for (const cat of categories) {
        const textChannel = cat.chnls.find(chnl => chnl.type === "text");
        if (textChannel) return textChannel.id;
    }
    return null;
}

function realmInit(sid: Id, name: string, categories: Ui_render__category[], isOwnEmoji: boolean, permission: number) {
    initRealmState(permission);
    createRealmNameSection(name, sid);

    navHTML.realms__channels.innerHTML = "";
    if (categories.length === 0 || categories.every(category => category.chnls.length === 0)) {
        navHTML.realms__channels.innerHTML = "No channels in this realm";
        vars.chat.chnl = null;
        return;
    }

    categories.forEach(category => createCategory(category, navHTML.realms__channels, sid));

    if (vars.chat.chnl === null)
        vars.chat.chnl = findFirstTextChannel(categories);

    coreFunc.changeChnl(vars.chat.chnl);
    if (isOwnEmoji) setupCustomEmoji(sid);
    // TODO whats do this code?
    // vars.realm.users.forEach(u => render_realm.usersInChat(u.uid));
}

export default realmInit;