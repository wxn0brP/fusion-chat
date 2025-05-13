import apis from "#apis";
import { syncManager } from "#socket/sync";
import { socketFetch } from "#socket/utils";
import { $store } from "#store";
import { Id } from "#types/base";
import { UiComponent } from "#types/component";
import { Vars_mainView__page } from "#types/var";

class FriendRequestView implements UiComponent {
    element: HTMLDivElement;
    container: HTMLDivElement;
    noRequests: HTMLDivElement;
    requestCount: HTMLDivElement;
    
    render(): void {
        const requests = $store.friendRequest.get();
        this.container.innerHTML = "";
        this.requestCount.innerHTML = `(${requests.length})`;

        if (requests.length == 0) {
            this.noRequests.style.display = "";
            return;
        } else this.noRequests.style.display = "none";

        requests.forEach(request => {
            const requestDiv = document.createElement("div");
            requestDiv.classList.add("main__view__friend");
            requestDiv.classList.add("userStatusMarker");
            requestDiv.setAttribute("data-status-id", request);

            requestDiv.innerHTML = `
                <img class="friend__avatar" src="/api/profile/img?id=${request}" />
                <div>
                    <div class="friend__name">${apis.www.changeUserID(request)}</div>
                    <button onclick="mglInt.mainView.requestFriendResponse('${request}', true)" class="request__btn">Accept</button>
                    <button onclick="mglInt.mainView.requestFriendResponse('${request}', false)" class="request__btn">Decline</button>
                </div>
            `;

            function showUser() {
                // socket.emit("user.profile", request);
            }
            requestDiv.querySelector(".friend__name").addEventListener("click", showUser);
            requestDiv.querySelector(".friend__avatar").addEventListener("click", showUser);

            this.container.appendChild(requestDiv);
            // updateUserProfileMarker(request, apiVars.user_state[request]?.status.get());
        });
    }
    
    mount(): void {
        this.element = document.querySelector("#main__view__requests");
        this.container = this.element.querySelector("#main__view__requests_container");
        this.noRequests = this.element.querySelector("#main__view__noRequests");
        this.requestCount = document.querySelector("#main__view__requests__count");

        $store.ui.mainView.view.subscribe((status: Vars_mainView__page) => {
            if (status == "requests") {
                this.element.style.display = "";
            } else {
                this.element.style.display = "none";
            }
        });

        $store.friendRequest.subscribe(this.render.bind(this));

        syncManager.register(async () => {
            const [requests] = await socketFetch<[Id[]]>("friend.requests.get");
            $store.friendRequest.set(requests);
        });
    }
}

const friendRequestView = new FriendRequestView();
export default friendRequestView;