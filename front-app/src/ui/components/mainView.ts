import hub from "../../hub";
hub("components/mainView");

import vars from "../../var/var";
import { mainViewHTML } from "../../var/html";
import coreFunc from "../../core/coreFunc";
import apis from "../../api/apis";
import socket from "../../core/socket/socket";
import uiFunc from "../helpers/uiFunc";
import Id from "../../types/Id";
import { Vars_mainView__page } from "../../types/var";
import LangPkg, { langFunc } from "../../utils/translate";

const mainView = {
    show() {
        socket.emit("friend.get.all");
        socket.emit("friend.requests.get");
    },

    renderFriends() {
        mainViewHTML.friendsContainer.innerHTML = "";

        if (vars.mainView.friends.length == 0) {
            mainViewHTML.noFriends.style.display = "";
            return;
        } else mainViewHTML.noFriends.style.display = "none";

        vars.mainView.friends.forEach(friend => {
            const friendDiv = document.createElement("div");
            friendDiv.classList.add("main__view__friend");
            friendDiv.setAttribute("user_id", friend._id);
            friendDiv.setAttribute("user_status", friend.status);

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
                socket.emit("user.profile", friend._id);
            });
            friendDiv.addEventListener("click", () => {
                coreFunc.changeChat("$" + friend._id);
            });
            mainViewHTML.friendsContainer.appendChild(friendDiv);
        });

        mainView.sortFriends(vars.mainView.page);
    },

    changeView(page: Vars_mainView__page) {
        vars.mainView.page = page;
        if (["all", "online", "offline"].includes(page)) {
            mainView.sortFriends(page);
            mainViewHTML.friends.style.display = "";
            mainViewHTML.requests.style.display = "none";
            mainView.renderFriends();
        }
        else if (page == "requests") {
            mainView.renderRequests();
            mainViewHTML.requests.style.display = "";
            mainViewHTML.friends.style.display = "none";
        }

        mainViewHTML.div.querySelectorAll<HTMLElement>("[main_view]").forEach(e => e.style.backgroundColor = "");
        document.querySelector<HTMLElement>(`[main_view="${page}"]`).style.backgroundColor = "var(--accent";
    },

    sortFriends(status: Vars_mainView__page) {
        const friends = mainViewHTML.div.querySelectorAll<HTMLElement>(".main__view__friend");
        if (friends.length == 0) return;
        mainViewHTML.noFriends.style.display = "none";
        let visibleCount = friends.length;

        friends.forEach(friend => {
            const friendStatus = friend.getAttribute("user_status");
            if (!friendStatus) return;

            if (status == "all") {
                friend.style.display = "";
            }
            else if (status == "online" && (friendStatus == "online" || friendStatus == "away")) {
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

        if (visibleCount == 0) mainViewHTML.noFriends.style.display = "";
    },

    renderRequests() {
        mainViewHTML.requestsContainer.innerHTML = "";
        mainViewHTML.requestCount.innerHTML = `(${vars.mainView.requests.length})`;

        if (vars.mainView.requests.length == 0) {
            mainViewHTML.noRequests.style.display = "";
            return;
        } else mainViewHTML.noRequests.style.display = "none";

        vars.mainView.requests.forEach(request => {
            const requestDiv = document.createElement("div");
            requestDiv.classList.add("main__view__friend");
            requestDiv.setAttribute("user_id", request);

            requestDiv.innerHTML = `
                <img class="friend__avatar" src="/api/profile/img?id=${request}" />
                <div>
                    <div class="friend__name">${apis.www.changeUserID(request)}</div>
                    <button onclick="mglInt.mainView.requestFriendResponse('${request}', true)" class="request__btn">Accept</button>
                    <button onclick="mglInt.mainView.requestFriendResponse('${request}', false)" class="request__btn">Decline</button>
                </div>
            `;

            function showUser() {
                socket.emit("user.profile", request);
            }
            requestDiv.querySelector(".friend__name").addEventListener("click", showUser);
            requestDiv.querySelector(".friend__avatar").addEventListener("click", showUser);

            mainViewHTML.requestsContainer.appendChild(requestDiv);
        });
    },

    removeFriend(friend: Id) {
        if (!friend) return;

        const conf = confirm(langFunc(LangPkg.ui.confirm.remove_friend, apis.www.changeUserID(friend)) + "?");
        if (!conf) return;
        const conf2 = confirm(langFunc(LangPkg.ui.confirm.sure, apis.www.changeUserID(friend)) + "?");
        if (!conf2) return;

        socket.emit("friend.remove", friend);
        socket.emit("friend.get.all");
    },

    removeFriendRequest(friend: Id) {
        if (!friend) return;

        const conf = confirm(langFunc(LangPkg.ui.confirm.remove_friend, apis.www.changeUserID(friend)) + "?");
        if (!conf) return;

        socket.emit("friend.request.remove", friend);
    },
}

mainView.changeView("online");

socket.on("friend.get.all", (friends) => {
    vars.mainView.friends = friends;
    mainView.renderFriends();
});

socket.on("friend.requests.get", (requests) => {
    vars.mainView.requests = requests;
    mainView.renderRequests();
});

socket.on("friend.request", (from) => {
    uiFunc.uiMsgT(LangPkg.ui.friend.request, apis.www.changeUserID(from));
    socket.emit("friend.requests.get");
});

socket.on("friend.response", (from, accept) => {
    if (!accept) {
        uiFunc.uiMsgT(LangPkg.ui.friend.declined, apis.www.changeUserID(from));
        return;
    }
    uiFunc.uiMsgT(LangPkg.ui.friend.request, apis.www.changeUserID(from));

    if (vars.chat.to != "main") return;
    socket.emit("friend.get.all");
});

export default mainView;