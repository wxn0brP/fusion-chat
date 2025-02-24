import hub from "../../hub";
hub("render/realm");

import vars from "../../var/var";
import Id from "../../types/Id";
import apis from "../../api/apis";
import renderUtils from "./utils";
import utils from "../../utils/utils";
import coreFunc from "../../core/coreFunc";
import socket from "../../core/socket/socket";
import contextMenu from "../components/contextMenu";
import { Ui_UserState } from "../../types/ui/render";
import { navHTML, renderHTML } from "../../var/html";
import { Vars_user__activity } from "../../types/var";
import { Core_socket__user_status_type } from "../../types/core/socket";
import { updateUserProfileMarker } from "./userStatusMarker";
import apiVars from "../../var/api";

const render_realm = {
    realms(data) {
        renderHTML.realms__content.innerHTML = "";
        vars.realms = data;
        data.forEach((realm) => {
            const id = realm.realm;
            const realmDiv = document.createElement("div");
            realmDiv.classList.add("realm");
            realmDiv.id = "realm_chat_" + id;
            if (realm.img) {
                realmDiv.innerHTML = `<img src="/userFiles/realms/${id}.png?time=${Date.now()}" alt="${apis.www.changeChat(id)}">`;
            } else {
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

    usersInChat() {
        navHTML.realm__users.innerHTML = "";
        const roles = vars.realm.roles;
        const users = vars.realm.users;
        const userColor = new Map();

        function getColor(id: Id) {
            if (userColor.has(id)) {
                return userColor.get(id);
            }

            const user = users.find(u => u.uid == id);
            if (!user) return;
            if (user.roles.length == 0) return "";

            for (let i = 0; i < roles.length; i++) {
                if (user.roles.includes(roles[i].name)) {
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
            userDiv.classList.add("userStatusMarker");
            userDiv.setAttribute("data-status-id", userID);

            if (!isBot) {
                userDiv.addEventListener("click", () => {
                    socket.emit("user.profile", userID);
                });
            }

            const userImg = document.createElement("img");
            userImg.src = "/api/profile/img?id=" + userID.replace("^", "");
            userDiv.appendChild(userImg);

            const textContainer = document.createElement("div");

            const nameDiv = document.createElement("div");
            nameDiv.innerHTML = apis.www.changeUserID(userID);
            nameDiv.style.color = getColor(userID);
            nameDiv.classList.add("realm_user_name");
            textContainer.appendChild(nameDiv);

            const activityDiv = document.createElement("div");
            activityDiv.innerHTML = "";
            activityDiv.id = "user_status_" + userID;
            activityDiv.classList.add("realm_user_status");
            textContainer.appendChild(activityDiv);

            userDiv.appendChild(textContainer);
            navHTML.realm__users.appendChild(userDiv);
            render_realm.realmUserStatus(userID);
            updateUserProfileMarker(userID, apiVars.user_state[userID]?.status.get());
        });
    },

    realmUserStatus(id: Id) {
        const ele = document.querySelector("#user_status_" + utils.escape(id));
        if (!ele) return;
        const data = apiVars.user_state[id];
        if (!data){
            updateUserProfileMarker(id, "offline");
            return;
        }
        
        updateUserProfileMarker(id, data.status.get() || "offline");

        const act = data.activity.get();
        if (!act?.state) {
            ele.innerHTML = data.statusText.get() || "";
            return;
        }
        ele.innerHTML = act.state + " | " + act.name;
    }
}

export default render_realm;