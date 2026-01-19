import { vars } from "#var/var";
import { Id } from "#types/Id";
import { apis } from "#api/apis";
import { utils } from "#utils/utils";
import { core_func } from "#core/coreFunc";
import { socket } from "#core/socket/socket";
import { uic_contextMenu } from "../components/contextMenu";
import { navHTML, renderHTML } from "#var/html";
import { uir_updateUserProfileMarker } from "./userStatusMarker";
import { apiVars } from "#var/api";
import { uic_realmUserProfile } from "../components/realmUserProfile";
import { Vars_realms } from "#types/var";

export namespace uir_realm {
    export async function sck_realms(data: Vars_realms[]) {
        renderHTML.realms__content.innerHTML = "";
        vars.realms = data;

        for (const realm of data) {
            const id = realm.realm;
            const realmDiv = document.createElement("div");
            realmDiv.classList.add("realm");
            realmDiv.id = "realm_chat_" + id;

            if (realm.img) {
                realmDiv.innerHTML = `<img src="/userFiles/realms/${id}.png?time=${Date.now()}" alt="${await apis.www.changeChat(id)}">`;
            } else {
                realmDiv.innerHTML = await apis.www.changeChat(id);
            }

            renderHTML.realms__content.appendChild(realmDiv);

            realmDiv.addEventListener("click", () => {
                core_func.changeChat(id);
            });

            uic_contextMenu.menuClickEvent(realmDiv, (e) => {
                uic_contextMenu.realm(e, id);
            });
        }
        core_func.markSelectedChat();
    }

    export async function usersInChat() {
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

        for (const userID of users.map(u => u.uid)) {
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

            uic_contextMenu.menuClickEvent(userDiv, (e) => {
                uic_realmUserProfile.render(userID);
            })

            const userImg = document.createElement("img");
            userImg.src = "/api/profile/img?id=" + userID.replace("^", "");
            userDiv.appendChild(userImg);

            const textContainer = document.createElement("div");

            const nameDiv = document.createElement("div");
            nameDiv.innerHTML = await apis.www.changeUserID(userID);
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
            uir_realm.realmUserStatus(userID);
            uir_updateUserProfileMarker(userID, apiVars.user_state[userID]?.status.get());
        }
    }

    export function realmUserStatus(id: Id) {
        const ele = document.querySelector("#user_status_" + utils.escape(id));
        if (!ele) return;
        const data = apiVars.user_state[id];
        if (!data) {
            uir_updateUserProfileMarker(id, "offline");
            return;
        }

        uir_updateUserProfileMarker(id, data.status.get() || "offline");

        const act = data.activity.get();
        if (!act?.state) {
            ele.innerHTML = data.statusText.get() || "";
            return;
        }
        ele.innerHTML = act.state + " | " + act.name;
    }
}