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

function realmInit(sid, name, categories, isOwnEmoji, permission){
    vars.realm = {
        users: [],
        roles: [],
        permission: [],
        text: [],
        desc: {},
    };

    vars.realm.permission = permission ?? 0;
    navHTML.realms__name.innerHTML = "";

    const nameText = document.createElement("div");
    nameText.innerHTML = name;
    nameText.title = name;
    nameText.id = "navs__realms__name__text";
    navHTML.realms__name.appendChild(nameText);

    const usersDisplayBtn = document.createElement("span");
    usersDisplayBtn.innerHTML = "👥";
    usersDisplayBtn.classList.add("realm_nav_btn");
    usersDisplayBtn.addEventListener("click", () => {
        renderState.chnl_user = !renderState.chnl_user;
        navHTML.realms__channels.style.display = renderState.chnl_user ? "none" : "";
        navHTML.realms__users.style.display = renderState.chnl_user ? "" : "none";
    })
    navHTML.realms__name.appendChild(usersDisplayBtn);

    const canUserEditRealm = permissionFunc.hasAnyPermission(permission, [
        permissionFlags.admin,
        permissionFlags.manageChannels,
        permissionFlags.manageRoles,
        permissionFlags.manageWebhooks,
        permissionFlags.manageEmojis,
    ])
    if(canUserEditRealm){
        const settingsBtn = document.createElement("span");
        settingsBtn.classList.add("realm_nav_btn");
        settingsBtn.innerHTML = "⚙️";
        settingsBtn.addEventListener("click", () => {
            socket.emit("realm.settings.get", sid);
            // settingsFunc.showrealmSettings({}, sid);
        });
        settingsBtn.id = "realmSettingsBtn";
        navHTML.realms__name.appendChild(settingsBtn);
    }

    function buildChannel(channel, root){
        const { name, type, desc, id: cid } = channel;
        const btn = document.createElement("div");
        btn.onclick = () => {
            if(type == "text" || type == "realm_event" || type == "open_event"){
                coreFunc.changeChnl(cid);
            }else if(type == "voice"){
                const chnl = vars.realm.chnlPerms[cid];
                if(!chnl) return;
                if(!chnl.write){
                    uiFunc.uiMsg(translateFunc.get("You can't have permission to join this voice channel") + "!");
                    return;
                }
                voiceFunc.joinToVoiceChannel(sid+"="+cid);
            }
        };
        btn.id = "channel_"+cid;
        btn.classList.add("channel_"+type);
        contextMenu.menuClickEvent(btn, (e) => {
            contextMenu.channel(e, cid, { type });
        })

        let typeEmoticon = "";
        switch(type){
            case "text":
                typeEmoticon = "📝";
            break;
            case "voice":
                typeEmoticon = "🎤";
            break;
            case "realm_event":
            case "open_event":
                typeEmoticon = "🎉";
            break
        }

        btn.innerHTML = typeEmoticon + " | " +name;
        root.appendChild(btn);
        vars.realm.desc[cid] = desc;
    }

    function buildCategory(name, channels, root){
        const detail = document.createElement("details");
        detail.open = true;

        const summary = document.createElement("summary");
        summary.innerHTML = name;
        detail.appendChild(summary);

        channels.forEach(channel => {
            buildChannel(channel, detail);
            vars.realm.chnlPerms[channel.id] = channel.perms;
        });
        root.appendChild(detail);
    }

    navHTML.realms__channels.innerHTML = "";
    if(categories.length === 0 || categories.every(category => category.chnls.length === 0)){
        navHTML.realms__channels.innerHTML = "No channels in this realm";
        vars.chat.chnl = null;
        return;
    }

    vars.realm.chnlPerms = {};
    vars.realm.desc = {};
    categories.forEach(category => {
        buildCategory(category.name, category.chnls, navHTML.realms__channels);
    });

    if(vars.chat.chnl == null){
        catLoop: for(let cat of categories){
            for(let chnl of cat.chnls){
                if(chnl.type == "text"){
                    vars.chat.chnl = chnl.id;
                    break catLoop;
                }
            }
        }
    }

    coreFunc.changeChnl(vars.chat.chnl);

    if(isOwnEmoji){
        coreHTML.emojiStyle.innerHTML = ""; // remove old emojis
        const emojiStyle = document.createElement("style");
        emojiStyle.innerHTML = `
            @font-face{
                font-family: 'emoji';
                src: url("/userFiles/emoji/${sid}.ttf") format("truetype");
                font-weight: normal;
                font-style: normal;
            }
            
            *{
                font-family: 'emoji', 'Ubuntu', sans-serif;
            }
        `;
        coreHTML.emojiStyle.appendChild(emojiStyle);
    }

    vars.realm.users.forEach(u => render_realm.usersInChat(u.uid));
}

export default realmInit;