import apis from "#api/apis";
import contextMenu from "#components/modal/contextMenu";
import socket from "#socket/socket";
import { $store } from "#store";
import { Id } from "#types/base";
import { UiComponent } from "#types/component";
import { Vars_realm__user } from "#types/var";
import utils from "#utils/utils";

class NavRealmsView implements UiComponent {
    element: HTMLDivElement;
    realm__name: HTMLDivElement;
    realm__channels: HTMLDivElement;
    realm__users: HTMLDivElement;
    realm__panel: HTMLDivElement;

    render(): void { }

    renderUsers(): void {
        const users = $store.realm.users.get();
        const roles = $store.realm.roles.get();
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
                    // socket.emit("user.profile", userID);
                });
            }

            contextMenu.menuClickEvent(userDiv, (e) => {
                // realmUserProfile.render(userID);
            })

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
            this.realm__users.appendChild(userDiv);
            // render_realm.realmUserStatus(userID);
            // updateUserProfileMarker(userID, apiVars.user_state[userID]?.status.get());
        });
    }

    mount(): void {
        this.element = document.querySelector("#navs__realms");
        this.realm__name = this.element.querySelector("#navs__realm__name");
        this.realm__channels = this.element.querySelector("#navs__realm__channels");
        this.realm__users = this.element.querySelector("#navs__realm__users");
        this.realm__panel = this.element.querySelector("#navs__realm__panel");

        $store.ui.navs.mainOpen.subscribe((open) => {
            this.element.style.display = !open ? "" : "none";
        });

        $store.ui.navs.realmUserOpen.subscribe((open) => {
            this.realm__channels.style.display = open ? "none" : "";
            this.realm__users.style.display = open ? "" : "none";
        });

        const realmRefresh = utils.debounce(this.renderUsers.bind(this), 100);

        $store.realm.users.subscribe(realmRefresh);
        $store.realm.roles.subscribe(realmRefresh);
    }
}

const navRealmsView = new NavRealmsView();
export default navRealmsView;