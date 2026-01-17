import { navHTML } from "#var/html";
import { vars } from "#var/var";
import { coreFunc } from "#core/coreFunc";
import { utils } from "#utils/utils";
import { apis } from "#api/apis";
import { socket } from "#core/socket/socket";
import { Core_socket__blocked, Core_socket__dm } from "#types/core/socket";
import { updateUserProfileMarker } from "./userStatusMarker";
import { apiVars } from "#var/api";
import { sortPrivs } from "./utils";

export namespace render_dm {
    export async function chats() {
        navHTML.priv.innerHTML = "";

        for (const id of sortPrivs(vars.privs)) {
            const privDiv = document.createElement("button");
            privDiv.classList.add("priv_chat");
            privDiv.classList.add("btn");
            privDiv.classList.add("userStatusMarker");
            privDiv.id = "priv_chat_" + id;
            privDiv.setAttribute("data-status-id", id);

            const structDiv = document.createElement("div");

            const profileImg = document.createElement("img");
            profileImg.src = "/api/profile/img?id=" + id;
            structDiv.appendChild(profileImg);

            structDiv.innerHTML += await apis.www.changeUserID(id);
            privDiv.appendChild(structDiv);
            navHTML.priv.appendChild(privDiv);

            privDiv.addEventListener("click", () => {
                coreFunc.changeChat("$" + id);
                setTimeout(() => {
                    privsRead();
                }, 100);
            });

            privDiv.addEventListener("contextmenu", (e) => {
                e.preventDefault();
                socket.emit("user.profile", id);
            });
            updateUserProfileMarker(id, apiVars.user_state[id]?.status.get());
        }

        privsRead();
        coreFunc.markSelectedChat();
    }

    export function privsRead() {
        vars.privs.forEach((id) => {
            const cl = document.querySelector("#priv_chat_" + id)?.classList;
            if (!cl) return;

            const l = apiVars.lastMess["$" + id]?.main;
            if (!l) return;
            let unreadPriv = false;

            if (l.read != null && l.mess != null) {
                unreadPriv = utils.extractTimeFromId(l.read) < utils.extractTimeFromId(l.mess);
            } else if (l.read == null && l.mess != null) {
                unreadPriv = true;
            }

            unreadPriv ? cl.add("unreadPriv") : cl.remove("unreadPriv");
        });
    }

    export function dm_get(data: Core_socket__dm[], blocked: Core_socket__blocked[]) {
        data.forEach((priv) => {
            const id = "$" + priv.priv;

            apiVars.lastMess[id] = apiVars.lastMess[id] || {};
            apiVars.lastMess[id].main = {
                read: priv.last?.main ?? null,
                mess: priv.lastMessId ?? null,
            }
        })
        vars.privs = data.map(d => d.priv);
        render_dm.chats();

        vars.blocked = blocked;
        if (vars.chat.to.startsWith("$")) coreFunc.dmPlaceholder(vars.chat.to.substring(1));
    }
}