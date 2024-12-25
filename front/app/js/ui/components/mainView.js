import hub from "../../hub.js";
hub("mainView");

import vars from "../../var/var.js";
import { magistral, mainViewHTML } from "../../var/html.js";
import coreFunc from "../../core/coreFunc.js";
import apis from "../../api/apis.js";
import socket from "../../core/socket/socket.js";
import uiFunc from "../helpers/uiFunc.js";
import translateFunc from "../../utils/translate.js";

const mainView = {
    show(){
        socket.emit("friend.getAll");
        socket.emit("friend.getRequests");
    },

    renderFriends(){
        mainViewHTML.friendsContainer.innerHTML = "";

        if(vars.mainView.friends.length == 0){
            mainViewHTML.noFriends.style.display = "";
            return;
        }else mainViewHTML.noFriends.style.display = "none";

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

    changeView(page){
        vars.mainView.page = page;
        if(["all", "online", "offline"].includes(page)){
            mainView.sortFriends(page);
            mainViewHTML.friends.style.display = "";
            mainViewHTML.requests.style.display = "none";
        }else
        if(page == "requests"){
            mainView.renderRequests();
            mainViewHTML.requests.style.display = "";
            mainViewHTML.friends.style.display = "none";
        }

        mainViewHTML.div.querySelectorAll("[main_view]").forEach(e => e.style.backgroundColor = "");
        document.querySelector(`[main_view="${page}"]`).style.backgroundColor = "var(--accent";
    },

    sortFriends(status){
        const friends = mainViewHTML.div.querySelectorAll(".main__view__friend");
        if(friends.length == 0) return;
        mainViewHTML.noFriends.style.display = "none";
        let visibleCount = friends.length;

        friends.forEach(friend => {
            const friendStatus = friend.getAttribute("user_status");
            if(!friendStatus) return;

            if(status == "all"){
                friend.style.display = "";
            }else
            if(status == "online" && (friendStatus == "online" || friendStatus == "away")){
                friend.style.display = "";
            }else
            if(status == "offline" && friendStatus == "offline"){
                friend.style.display = "";
            }
            else{
                friend.style.display = "none";
                visibleCount--;
            }
        });

        if(visibleCount == 0) mainViewHTML.noFriends.style.display = "";
    },

    renderRequests(){
        mainViewHTML.requestsContainer.innerHTML = "";
        mainViewHTML.requestCount.innerHTML = `(${vars.mainView.requests.length})`;

        if(vars.mainView.requests.length == 0){
            mainViewHTML.noRequests.style.display = "";
            return;
        }else mainViewHTML.noRequests.style.display = "none";

        vars.mainView.requests.forEach(request => {
            const requestDiv = document.createElement("div");
            requestDiv.classList.add("main__view__friend");
            requestDiv.setAttribute("user_id", request);

            requestDiv.innerHTML = `
                <img class="friend__avatar" src="/api/profile/img?id=${request}" />
                <div>
                    <div class="friend__name">${apis.www.changeUserID(request)}</div>
                    <button onclick="mainView.requestFriendResponse('${request}', true)" class="request__btn">Accept</button>
                    <button onclick="mainView.requestFriendResponse('${request}', false)" class="request__btn">Decline</button>
                </div>
            `;

            function showUser(){
                socket.emit("user.profile", request);
            }
            requestDiv.querySelector(".friend__name").addEventListener("click", showUser);
            requestDiv.querySelector(".friend__avatar").addEventListener("click", showUser);

            mainViewHTML.requestsContainer.appendChild(requestDiv);
        });
    },

    requestFriendResponse(user_id, accept){
        if(!user_id) return;
        const div = mainViewHTML.div.querySelector(`.main__view__friend[user_id="${user_id}"]`);
        if(!div) return;

        socket.emit("friend.response", user_id, accept);
        div.remove();
        vars.mainView.requests = vars.mainView.requests.filter(e => e != user_id);
        mainViewHTML.requestCount.innerHTML = `(${vars.mainView.requests.length})`;

        if(accept) socket.emit("friend.getAll");
    },

    async addFriend(friend){
        if(!friend) friend = await uiFunc.prompt(translateFunc.get("Enter friend Name"));
        
        if(!friend) return;
        socket.emit("friend.request", friend);
    },

    removeFriend(friend){
        if(!friend) return;

        const conf = confirm(translateFunc.get("Do you really want to remove $ from your friends list?", apis.www.changeUserID(friend)));
        if(!conf) return;
        const conf2 = confirm(translateFunc.get("Are you sure?", apis.www.changeUserID(friend)));
        if(!conf2) return;

        socket.emit("friend.remove", friend);
        socket.emit("friend.getAll");
    },

    removeFriendRequest(friend){
        if(!friend) return;

        const conf = confirm(translateFunc.get("Do you really want to remove $ from your friend requests list?", apis.www.changeUserID(friend)));
        if(!conf) return;

        socket.emit("friend.requestRemove", friend);
    },

    showNav(){
        if(mainViewHTML.nav.clientHeight == 0){
            mainViewHTML.nav.fadeIn();
        }else{
            mainViewHTML.nav.fadeOut();
        }
    }
}

mainView.changeView("online");

socket.on("friend.getAll", (friends) => {
    vars.mainView.friends = friends;
    mainView.renderFriends();
});

socket.on("friend.getRequests", (requests) => {
    vars.mainView.requests = requests;
    mainView.renderRequests();
});

socket.on("friend.request", (from) => {
    uiFunc.uiMsg(translateFunc.get("Friend request from $", apis.www.changeUserID(from)));
    socket.emit("friend.getRequests");
});

socket.on("friend.response", (from, accept) => {
    if(!accept){
        uiFunc.uiMsg(translateFunc.get("Declined friend request from $", apis.www.changeUserID(from)));
        return;
    }
    uiFunc.uiMsg(translateFunc.get("Accepted friend request from $", apis.www.changeUserID(from)));

    if(vars.chat.to != "main") return;
    socket.emit("friend.getAll");
});

export default mainView;
magistral.mainView = mainView;