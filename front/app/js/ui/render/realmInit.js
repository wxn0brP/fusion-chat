import hub from "../../hub.js";
hub("render/realmInit");

import vars from "../../var/var.js";
import { coreHTML, navHTML } from "../../var/html.js";
import coreFunc from "../../core/coreFunc.js";
import contextMenu from "../components/contextMenu.js";
import { renderState } from "./var.js";
import permissionFunc, { permissionFlags } from "../../utils/perm.js";
import translateFunc from "../../utils/translate.js";
import uiFunc from "../helpers/uiFunc.js";
import socket from "../../core/socket/socket.js";
import voiceFunc from "../components/voice.js";


function initRealmState(permission = 0){
    vars.realm = {
        users: [],
        roles: [],
        permission: permission,
        text: [],
        desc: {},
        chnlPerms: {}
    };
}

function createRealmNameSection(name, sid){
    navHTML.realms__name.innerHTML = "";
    
    const nameText = document.createElement("div");
    nameText.innerHTML = name;
    nameText.title = name;
    nameText.id = "navs__realms__name__text";
    navHTML.realms__name.appendChild(nameText);
    
    addUsersDisplayButton();
    addSettingsButtonIfAllowed(sid);
}

function addUsersDisplayButton(){
    const usersDisplayBtn = document.createElement("span");
    usersDisplayBtn.innerHTML = "👥";
    usersDisplayBtn.classList.add("realm_nav_btn");
    usersDisplayBtn.addEventListener("click", toggleUserDisplay);
    navHTML.realms__name.appendChild(usersDisplayBtn);
}

function toggleUserDisplay(){
    renderState.chnl_user = !renderState.chnl_user;
    navHTML.realms__channels.style.display = renderState.chnl_user ? "none" : "";
    navHTML.realms__users.style.display = renderState.chnl_user ? "" : "none";
}

function addSettingsButtonIfAllowed(sid){
    const requiredPermissions = [
        permissionFlags.admin,
        permissionFlags.manageChannels,
        permissionFlags.manageRoles,
        permissionFlags.manageWebhooks,
        permissionFlags.manageEmojis,
    ];
    
    if(permissionFunc.hasAnyPermission(vars.realm.permission, requiredPermissions)){
        const settingsBtn = document.createElement("span");
        settingsBtn.classList.add("realm_nav_btn");
        settingsBtn.innerHTML = "⚙️";
        settingsBtn.addEventListener("click", () => socket.emit("realm.settings.get", sid));
        settingsBtn.id = "realmSettingsBtn";
        navHTML.realms__name.appendChild(settingsBtn);
    }
}

function createChannel(channel, root, sid){
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

function getChannelTypeEmoticon(type){
    const emoticons = {
        text: "📝",
        voice: "🎤",
        realm_event: "🎉",
        open_event: "🎉"
    };
    return emoticons[type] || "";
}

function handleChannelClick(type, cid, sid){
    if(type === "text" || type === "realm_event" || type === "open_event"){
        coreFunc.changeChnl(cid);
    } else if(type === "voice"){
        handleVoiceChannelJoin(cid, sid);
    }
}

function handleVoiceChannelJoin(cid, sid){
    const chnl = vars.realm.chnlPerms[cid];
    if(!chnl || !chnl.write){
        uiFunc.uiMsg(translateFunc.get("You can't have permission to join this voice channel") + "!");
        return;
    }
    voiceFunc.joinToVoiceChannel(sid + "=" + cid);
}

function createCategory(category, root, sid){
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

function setupCustomEmoji(sid){
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

function findFirstTextChannel(categories){
    for (const cat of categories){
        const textChannel = cat.chnls.find(chnl => chnl.type === "text");
        if(textChannel) return textChannel.id;
    }
    return null;
}

function realmInit(sid, name, categories, isOwnEmoji, permission){
    initRealmState(permission);
    createRealmNameSection(name, sid);

    navHTML.realms__channels.innerHTML = "";
    if(categories.length === 0 || categories.every(category => category.chnls.length === 0)){
        navHTML.realms__channels.innerHTML = "No channels in this realm";
        vars.chat.chnl = null;
        return;
    }

    categories.forEach(category => createCategory(category, navHTML.realms__channels, sid));

    if(vars.chat.chnl === null)
        vars.chat.chnl = findFirstTextChannel(categories);

    coreFunc.changeChnl(vars.chat.chnl);
    if(isOwnEmoji) setupCustomEmoji(sid);
    vars.realm.users.forEach(u => render_realm.usersInChat(u.uid));
}

export default realmInit;