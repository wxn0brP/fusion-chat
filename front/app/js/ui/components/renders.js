import hub from "../../hub.js";
hub("renders");

import { navHTML, renderHTML } from "../../var/html.js";
import vars from "../../var/var.js";
import utils from "../../utils/utils.js";
import apis from "../../api/apis.js";
import mainView from "./mainView.js";
import translateFunc from "../../utils/translate.js";
import contextMenu from "./contextMenu.js";
import coreFunc from "../../core/coreFunc.js";
import socket from "../../core/socket/ws.js";
import permissionFunc, { permissionFlags } from "../../utils/perm.js";
import voiceFunc from "./voice.js";

export const friendStatusEnum = {
    NOT_FRIEND: 0,
    IS_FRIEND: 1,
    REQUEST_SENT: 2,
    REQUEST_RECEIVED: 3,
}

const renderFunc = {
    state: {
        chnl_user: false,
    },

    privs(){
        navHTML.priv.innerHTML = "";

        renderUtils.sortPrivs(vars.privs).forEach((id) => {
            const privDiv = document.createElement("button");
            privDiv.classList.add("priv_chat");
            privDiv.classList.add("btn");
            privDiv.id = "priv_chat_"+id;

            const structDiv = document.createElement("div");

            const profileImg = document.createElement("img");
            profileImg.src = "/api/profile/img?id=" + id;
            structDiv.appendChild(profileImg);

            structDiv.innerHTML += apis.www.changeUserID(id);
            privDiv.appendChild(structDiv);
            navHTML.priv.appendChild(privDiv);

            privDiv.addEventListener("click", () => {
                coreFunc.changeChat("$"+id);
                setTimeout(() => {
                    renderFunc.privsRead();
                }, 100);
            });
        });
        renderFunc.privsRead();
        coreFunc.markSelectedChat();
    },

    privsRead(){
        vars.privs.forEach((id) => {
            const cl = document.querySelector("#priv_chat_"+id)?.classList;
            if(!cl) return;

            const l = vars.lastMess["$"+id]?.main;
            if(!l) return;
            let unreadPriv = false;

            if(l.read != null && l.mess != null){
                unreadPriv = utils.extractTimeFromId(l.read) < utils.extractTimeFromId(l.mess);
            }else if(l.read == null && l.mess != null){
                unreadPriv = true;
            }

            unreadPriv ? cl.add("unreadPriv") : cl.remove("unreadPriv");
        });
    },

    realms(data){
        realms__content.innerHTML = "";
        vars.realms = data;
        data.forEach((realm) => {
            const id = realm.realm;
            const realmDiv = document.createElement("div");
            realmDiv.classList.add("realm");
            realmDiv.id = "realm_chat_"+id;
            if(realm.img){
                realmDiv.innerHTML = `<img src="/userFiles/realms/${id}.png?time=${Date.now()}" alt="${apis.www.changeChat(id)}">`;
            }else{
                realmDiv.innerHTML = apis.www.changeChat(id);
            }
            realms__content.appendChild(realmDiv);

            realmDiv.addEventListener("click", () => {
                coreFunc.changeChat(id);
            });

            contextMenu.menuClickEvent(realmDiv, (e) => {
                contextMenu.realm(e, id);
            });
        });
        coreFunc.markSelectedChat();
    },

    localUserProfile(){
        navHTML.user__name.innerHTML = apis.www.changeUserID(vars.user._id);
        navHTML.user__status.innerHTML = vars.user.statusText || vars.user.status || "Online";
    },

    userProfile(data){
        if(!data) return;
        const targetIsMe = data._id == vars.user._id;
        const imgLink = "/api/profile/img?id=" + data._id;

        renderHTML.userProfile.innerHTML = `
            <div id="userProfileInfo">
                <img src="${imgLink}" onclick="createMediaPopup('${imgLink}')" alt="User logo">
                <div>
                    <h1>${data.name}</h1>
                    <p>${data.status}${data.statusText ? " | "+data.statusText : ""}</p>
                    <div id="userProfileBtns" style="margin-top: 10px;"></div>
                </div>
            </div>
            <div id="userProfileActivity"></div>
            <div id="userProfileAbout"></div>
        `.trim();

        if(!targetIsMe){
            const frinedBtn = document.createElement("button");
            frinedBtn.classList.add("btn");
            let frinedBtnText;
            switch(data.friendStatus){
                case friendStatusEnum.NOT_FRIEND:
                    frinedBtnText = "Add friend";
                    frinedBtn.onclick = () => mainView.addFriend(data._id);
                break;
                case friendStatusEnum.IS_FRIEND:
                    frinedBtnText = "Remove friend";
                    frinedBtn.onclick = () => mainView.removeFriend(data._id);
                break;
                case friendStatusEnum.REQUEST_SENT:
                    frinedBtnText = "Friend request sent (click to cancel)";
                    frinedBtn.onclick = () => mainView.removeFriendRequest(data._id);
                break;
                case friendStatusEnum.REQUEST_RECEIVED:
                    frinedBtnText = "Request received (click to view)";
                    frinedBtn.onclick = () => {
                        coreFunc.changeChat("main");
                        mainView.changeView("requests");
                    }
                break;
            }
            frinedBtn.innerHTML = translateFunc.get(frinedBtnText);
            renderHTML.userProfile.querySelector("#userProfileBtns").appendChild(frinedBtn);
            
            const blockBtn = document.createElement("button");
            blockBtn.classList.add("btn");
            blockBtn.style.marginLeft = "10px";
            blockBtn.innerHTML = translateFunc.get(data.isBlocked ? "Unblock" : "Block");
            blockBtn.onclick = () => {
                data.isBlocked = !data.isBlocked;
                socket.emit("dm.block", data._id, data.isBlocked);
            }
            renderHTML.userProfile.querySelector("#userProfileBtns").appendChild(blockBtn);
        }

        const activityDiv = renderHTML.userProfile.querySelector("#userProfileActivity");
        if(data.activity?.state){
            const act = data.activity;
            activityDiv.innerHTML = `
                <h2>Activity</h2>
                <p>${act.state} | ${act.name}</p>
                ${act.details ? "<p>" + act.details + "</p>" : ""}
                ${act.startTime ? '<p>Time: <span id="userProfileActivityTime"></span></p>' : ""}
                ${
                    act.party ?
                        "<p>Party: "+
                            act.party.id + " | " +
                            act.party.state +
                            (act.party.max ? " / " + act.party.max : "") +
                        "</p>"
                    : ""}
            `.trim();
            renderFunc.serverUserStatus(data._id, Object.assign({}, data.activity));
            if(act.startTime){
                const timeP = activityDiv.querySelector("#userProfileActivityTime");
                function update(){
                    const time = new Date() - new Date(act.startTime);
                    const hours = Math.floor(time / 1000 / 60 / 60);
                    const minutes = Math.floor(time / 1000 / 60) - (hours * 60);
                    const seconds = Math.floor(time / 1000) - (hours * 60 * 60) - (minutes * 60);
                    timeP.innerHTML = `${hours}:${minutes}:${seconds}`;
                }
                let interval = setInterval(() => {
                    if(!timeP) return clearInterval(interval);
                    update();    
                }, 1000);
                update();
            }
        }

        renderUtils.initPopup(renderHTML.userProfile);
    },

    realmInit(sid, name, categories, isOwnEmoji, permission){
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
            renderFunc.state.chnl_user = !renderFunc.state.chnl_user;
            navHTML.realms__channels.style.display = renderFunc.state.chnl_user ? "none" : "";
            navHTML.realms__users.style.display = renderFunc.state.chnl_user ? "" : "none";
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
            settingsBtn.id = "serverSettingsBtn";
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
            navHTML.realms__channels.innerHTML = "No channels in this server";
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
            emojiStyleDiv.appendChild(emojiStyle);
        }

        vars.realm.users.forEach(u => renderFunc.usersInChat(u.uid));
    },

    usersInChat(){
        navHTML.realms__users.innerHTML = "";
        const roles = vars.realm.roles;
        const users = vars.realm.users;
        const userColor = new Map();

        function getColor(id){
            if(userColor.has(id)){
                return userColor.get(id);
            }

            const user = users.find(u => u.uid == id);
            if(!user) return;
            if(user.roles.length == 0) return "";

            for(let i=0; i<roles.length; i++){
                if(user.roles.includes(roles[i].name)){
                    const color = roles[i].c;
                    userColor.set(id, color);
                    return color;
                }
            }
            return "";
        }

        users.map(u => u.uid).forEach((userID) => {
            const isBot = userID[0] == "^";
            const userDiv = document.createElement("div");
            userDiv.classList.add("realm_user_div");

            if(!isBot){
                userDiv.addEventListener("click", () => {
                    socket.emit("user.profile", userID);
                });
            }

            const userImg = document.createElement("img");
            userImg.src = !isBot ? "/api/profile/img?id="+userID : "/favicon.svg";
            userDiv.appendChild(userImg);

            const textContainer = document.createElement("div");

            const nameDiv = document.createElement("div");
            nameDiv.innerHTML = apis.www.changeUserID(userID);
            nameDiv.style.color = getColor(userID);
            nameDiv.classList.add("realm_user_name");
            textContainer.appendChild(nameDiv);

            const activityDiv = document.createElement("div");
            activityDiv.innerHTML = "";
            activityDiv.id = "user_status_"+userID;
            activityDiv.classList.add("realm_user_status");
            textContainer.appendChild(activityDiv);

            userDiv.appendChild(textContainer);
            navHTML.realms__users.appendChild(userDiv);
            renderFunc._serverUserStatus(userID);
        });
    },

    _serverUserStatus(id){
        const ele = document.querySelector("#user_status_"+utils.escape(id));
        if(!ele) return;
        const data = vars.apisTemp.user_status[id];
        if(!data) return;

        const act = data.activity.get();
        if(!act?.state){
            ele.innerHTML = data.text.get() || "";
            return;
        }
        ele.innerHTML = act.state + " | " + act.name;
    },

    serverUserStatus(id, state){
        let { text, activity } = state;
        const temp = vars.apisTemp.user_status;
        if(!temp[id]){
            const userStatus = temp[id] = {};
            userStatus.text = renderUtils.createUpdater(() => renderFunc._serverUserStatus(id), text ?? "");
            userStatus.activity = renderUtils.createUpdater(() => renderFunc._serverUserStatus(id), activity ?? {});
        }

        if(text) temp[id].text.set(text);
        if(activity) temp[id].activity.set(activity);
    }
}

const renderUtils = {
    getLastFromChat(obj){
        let latestTime = null;
      
        for(let key in obj){
            if(!obj.hasOwnProperty(key)) continue;
            const id = obj[key];
            const time = utils.extractTimeFromId(id);
    
            if(time !== null && (latestTime === null || time > latestTime)) latestTime = time;
        }
        
        return latestTime;
    },

    sortPrivs(data){
        const sortedData = [...data];
        sortedData.sort((a, b) => {
            const la = vars.lastMess["$"+a]?.main;
            const lb = vars.lastMess["$"+b]?.main;
            if(!la || !lb) return 0;

            return utils.extractTimeFromId(lb.mess) - utils.extractTimeFromId(la.mess);
        });

        return sortedData;
    },

    initPopup(popup){
        if(!popup) return;

        const isAlreadyOpen = popup.getAttribute("opened");
        if(isAlreadyOpen){
            popup.setAttribute("opened", "2");
            return;
        }

        popup.setAttribute("opened", "1");
        popup.fadeIn();

        const closePopup = () => {
            setTimeout(() => {
                const isPopupStillOpen = popup.getAttribute("opened") === "2";
                if(isPopupStillOpen){
                    popup.setAttribute("opened", "1");
                    return;
                }
                popup.fadeOut();
                document.body.removeEventListener("click", closePopup);
                setTimeout(() => {
                    popup.removeAttribute("opened");
                }, 800);
            }, 100);
        };

        setTimeout(() => {
            document.body.addEventListener("click", closePopup);
        }, 100);
    },

    createUpdater(cb, initialValue){
        return {
            _value: initialValue,
            get(){
                return this._value;
            },
            set(newValue){
                this._value = newValue;
                cb(newValue);
            }
        }
    },
}

socket.on("dm.get", (data) => {
    data.forEach((priv) => {
        const id = "$"+priv.priv;

        vars.lastMess[id] = vars.lastMess[id] || {};
        vars.lastMess[id].main = {
            read: priv.last?.main ?? null,
            mess: priv.lastMessId ?? null,
        }
    })
    vars.privs = data.map(d => d.priv);
    renderFunc.privs();
});

socket.on("realm.get", renderFunc.realms);
socket.on("realm.setup", renderFunc.realmInit);
socket.on("user.profile", renderFunc.userProfile);

export default renderFunc;