import hub from "../../hub.js";
hub("render/realm");

import vars from "../../var/var.js";
import { navHTML, renderHTML } from "../../var/html.js";
import coreFunc from "../../core/coreFunc.js";
import contextMenu from "../components/contextMenu.js";
import apis from "../../api/apis.js";
import renderUtils from "./utils.js";
import utils from "../../utils/utils.js";
import socket from "../../core/socket/socket.js";

const render_realm = {
    realms(data){
        renderHTML.realms__content.innerHTML = "";
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
            renderHTML.realms__content.appendChild(realmDiv);

            realmDiv.addEventListener("click", () => {
                coreFunc.changeChat(id);
            });

            contextMenu.menuClickEvent(realmDiv, (e) => {
                contextMenu.realm(e, id);
            });
        });
        coreFunc.markSelectedChat();
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
            render_realm._realmUserStatus(userID);
        });
    },

    _realmUserStatus(id){
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

    realmUserStatus(id, state){
        let { text, activity } = state;
        const temp = vars.apisTemp.user_status;
        if(!temp[id]){
            const userStatus = temp[id] = {};
            userStatus.text = renderUtils.createUpdater(() => render_realm._realmUserStatus(id), text ?? "");
            userStatus.activity = renderUtils.createUpdater(() => render_realm._realmUserStatus(id), activity ?? {});
        }

        if(text) temp[id].text.set(text);
        if(activity) temp[id].activity.set(activity);
    }
}

export default render_realm;