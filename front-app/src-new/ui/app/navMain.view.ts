import apis from "#apis";
import { syncManager } from "#socket/sync";
import { socketFetch } from "#socket/utils";
import { $store } from "#store";
import { UiComponent } from "#types/component";
import { Core_socket__blocked, Core_socket__dm } from "#types/core/socket";
import { changeToDmChat } from "#features/mess";
import { sortPrivs } from "#helpers/sortPrivs";

class NavMainView implements UiComponent {
    element: HTMLDivElement;
    privs: HTMLDivElement;

    render(): void {
        const privs = $store.dm.get();
        this.privs.innerHTML = "";

        sortPrivs(privs.map(d => d.priv)).forEach((id) => {
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

            structDiv.innerHTML += apis.www.changeUserID(id);
            privDiv.appendChild(structDiv);
            this.privs.appendChild(privDiv);

            privDiv.addEventListener("click", () => {
                changeToDmChat("$"+id);
                // setTimeout(() => {
                //     render_dm.privsRead();
                // }, 100);
            });

            // privDiv.addEventListener("contextmenu", (e) => {
            //     e.preventDefault();
            //     socket.emit("user.profile", id);
            // });
            // updateUserProfileMarker(id, apiVars.user_state[id]?.status.get());
        });
        // render_dm.privsRead();
        // coreFunc.markSelectedChat();
    }

    mount(): void {
        this.element = document.querySelector("#navs__main");
        this.privs = document.querySelector("#navs__priv");

        $store.ui.navs.mainOpen.subscribe((open) => {
            this.element.style.display = open ? "" : "none";
        });

        $store.dm.subscribe(this.render.bind(this));

        syncManager.register(async () => {
            const user = await socketFetch<[Core_socket__dm[], Core_socket__blocked[]]>("dm.get");
            $store.dm.set(user[0]);
            $store.blocked.set(user[1]);
        });
    }
}

const navMainView = new NavMainView();
export default navMainView;