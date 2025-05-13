import apis from "#apis";
import { syncManager } from "#socket/sync";
import { socketFetch } from "#socket/utils";
import { $store } from "#store";
import { UiComponent } from "#types/component";
import { Vars_mainView__friend, Vars_mainView__page } from "#types/var";
import { changeToDmChat } from "#features/mess";

class FriendsView implements UiComponent {
    element: HTMLDivElement;
    noFriends: HTMLDivElement;
    container: HTMLDivElement;

    render(): void {
        const friends = $store.friends.get();
        this.container.innerHTML = "";
        friends.forEach(friend => {
            const friendDiv = document.createElement("div");
            friendDiv.classList.add("main__view__friend");
            friendDiv.classList.add("userStatusMarker");
            friendDiv.setAttribute("data-status-id", friend._id);

            friendDiv.innerHTML = `
                <img class="friend__avatar" src="/api/profile/img?id=${friend._id}" />
                <div>
                    <span class="friend__name">${apis.www.changeUserID(friend._id)}</span>
                    <br />
                    <span class="friend__status">${friend.status}</span>
                    ${friend.text ? `<span class="friend__status_text">${friend.text}</span>` : ""}
                </div>
            `.trim();

            friendDiv.querySelector(".friend__name").addEventListener("click", (e) => {
                e.stopPropagation();
                // socketEvt["user.profile"].emitDataId(friend._id);
            });
            friendDiv.addEventListener("click", () => {
                changeToDmChat("$" + friend._id);
            });
            this.container.appendChild(friendDiv);

            // UserStateManager.set(friend._id, {
            //     status: friend?.status,
            //     statusText: friend?.text
            // });
        });

        this.sortFriends($store.ui.mainView.view.get());
    }

    sortFriends(status: Vars_mainView__page) {
        const friends = this.element.querySelectorAll<HTMLElement>(".main__view__friend");
        if (friends.length == 0) return;
        this.noFriends.style.display = "none";
        let visibleCount = friends.length;

        friends.forEach(friend => {
            const friendStatus = friend.getAttribute("data-status") || "offline";

            if (status == "all") {
                friend.style.display = "";
            }
            else if (status == "online" && (friendStatus == "online" || friendStatus == "idle" || friendStatus == "dnd")) {
                friend.style.display = "";
            }
            else if (status == "offline" && friendStatus == "offline") {
                friend.style.display = "";
            }
            else {
                friend.style.display = "none";
                visibleCount--;
            }
        });

        if (visibleCount == 0) this.noFriends.style.display = "";
    }

    mount(): void {
        this.element = document.querySelector("#main__view__friends");
        this.container = this.element.querySelector("#main__view__friends_container");
        this.noFriends = this.element.querySelector("#main__view__noFriends");

        $store.friends.subscribe(this.render.bind(this));

        $store.ui.mainView.view.subscribe((status: Vars_mainView__page) => {
            if (status == "requests") {
                this.element.style.display = "none";
            } else {
                this.sortFriends(status);
                this.element.style.display = "";
            }
        })

        syncManager.register(async () => {
            const [friends] = await socketFetch<[Vars_mainView__friend[]]>("friend.get.all");
            $store.friends.set(friends);
        });
    }
}

const friendsView = new FriendsView();
export default friendsView;