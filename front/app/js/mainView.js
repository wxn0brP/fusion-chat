const mainViewDiv = document.querySelector("#main__view");
const mainViewDivs = {
    nav: document.querySelector("#main__view__nav"),
    friends: mainViewDiv.querySelector("#main__view__friends"),
    requests: mainViewDiv.querySelector("#main__view__requests"),
    requestCount: mainViewDiv.querySelector("#main__view__requests__count"),
    noFriends: mainViewDiv.querySelector("#main__view__noFriends"),
    noRequests: mainViewDiv.querySelector("#main__view__noRequests"),
    friendsContainer: mainViewDiv.querySelector("#main__view__friends_container"),
    requestsContainer: mainViewDiv.querySelector("#main__view__requests_container"),
}

const mainView = {
    show(){
        socket.emit("getFriends");
        socket.emit("getFriendRequests");
    },

    renderFriends(){
        mainViewDivs.friendsContainer.innerHTML = "";

        if(vars.mainView.friends.length == 0){
            mainViewDivs.noFriends.style.display = "";
            return;
        }else mainViewDivs.noFriends.style.display = "none";

        vars.mainView.friends.forEach(friend => {
            const friendDiv = document.createElement("div");
            friendDiv.classList.add("main__view__friend");
            friendDiv.setAttribute("user_id", friend._id);
            friendDiv.setAttribute("user_status", friend.status);

            friendDiv.innerHTML = `
                <img class="friend__avatar" src="/profileImg?id=${friend._id}" />
                <div>
                    <span class="friend__name">${apis.www.changeUserID(friend._id)}</span>
                    <br />
                    <span class="friend__status">${friend.status}</span>
                    ${friend.text ? `<span class="friend__status_text">${friend.text}</span>` : ""}
                </div>
            `.trim();

            friendDiv.querySelector(".friend__name").addEventListener("click", (e) => {
                e.stopPropagation();
                socket.emit("userProfile", friend._id);
            });
            friendDiv.addEventListener("click", () => {
                coreFunc.changeChat("$" + friend._id);
            });
            mainViewDivs.friendsContainer.appendChild(friendDiv);
        });

        mainView.sortFriends(vars.mainView.page);
    },

    changeView(page){
        vars.mainView.page = page;
        if(["all", "online", "offline"].includes(page)){
            mainView.sortFriends(page);
            mainViewDivs.friends.style.display = "";
            mainViewDivs.requests.style.display = "none";
        }else
        if(page == "requests"){
            mainView.renderRequests();
            mainViewDivs.requests.style.display = "";
            mainViewDivs.friends.style.display = "none";
        }

        mainViewDiv.querySelectorAll("[main_view]").forEach(e => e.style.backgroundColor = "");
        document.querySelector(`[main_view="${page}"]`).style.backgroundColor = "var(--accent";
    },

    sortFriends(status){
        const friends = mainViewDiv.querySelectorAll(".main__view__friend");
        if(friends.length == 0) return;
        mainViewDivs.noFriends.style.display = "none";
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

        if(visibleCount == 0) mainViewDivs.noFriends.style.display = "";
    },

    renderRequests(){
        mainViewDivs.requestsContainer.innerHTML = "";
        mainViewDivs.requestCount.innerHTML = `(${vars.mainView.requests.length})`;

        if(vars.mainView.requests.length == 0){
            mainViewDivs.noRequests.style.display = "";
            return;
        }else mainViewDivs.noRequests.style.display = "none";

        vars.mainView.requests.forEach(request => {
            const requestDiv = document.createElement("div");
            requestDiv.classList.add("main__view__friend");
            requestDiv.setAttribute("user_id", request);

            requestDiv.innerHTML = `
                <img class="friend__avatar" src="/profileImg?id=${request}" />
                <div>
                    <div class="friend__name">${apis.www.changeUserID(request)}</div>
                    <button onclick="mainView.requestFriendResponse('${request}', true)" class="request__btn">Accept</button>
                    <button onclick="mainView.requestFriendResponse('${request}', false)" class="request__btn">Decline</button>
                </div>
            `;

            function showUser(){
                socket.emit("userProfile", request);
            }
            requestDiv.querySelector(".friend__name").addEventListener("click", showUser);
            requestDiv.querySelector(".friend__avatar").addEventListener("click", showUser);

            mainViewDivs.requestsContainer.appendChild(requestDiv);
        });
    },

    requestFriendResponse(user_id, accept){
        if(!user_id) return;
        const div = mainViewDiv.querySelector(`.main__view__friend[user_id="${user_id}"]`);
        if(!div) return;

        socket.emit("requestFriendResponse", user_id, accept);
        div.remove();
        vars.mainView.requests = vars.mainView.requests.filter(e => e != user_id);
        mainViewDivs.requestCount.innerHTML = `(${vars.mainView.requests.length})`;

        if(accept) socket.emit("getFriends");
    },

    async addFriend(friend){
        if(!friend) friend = await uiFunc.prompt(translateFunc.get("Enter friend Name"));
        
        if(!friend) return;
        socket.emit("requestFriend", friend);
    },

    removeFriend(friend){
        if(!friend) return;

        const conf = confirm(translateFunc.get("Do you really want to remove $ from your friends list?", apis.www.changeUserID(friend)));
        if(!conf) return;
        const conf2 = confirm(translateFunc.get("Are you sure?", apis.www.changeUserID(friend)));
        if(!conf2) return;

        socket.emit("removeFriend", friend);
        socket.emit("getFriends");
    },

    removeFriendRequest(friend){
        if(!friend) return;

        const conf = confirm(translateFunc.get("Do you really want to remove $ from your friend requests list?", apis.www.changeUserID(friend)));
        if(!conf) return;

        socket.emit("removeFriendRequest", friend);
    },

    showNav(){
        if(mainViewDivs.nav.clientHeight == 0){
            mainViewDivs.nav.fadeIn();
        }else{
            mainViewDivs.nav.fadeOut();
        }
    }
}

mainView.changeView("online");

socket.on("getFriends", (friends) => {
    vars.mainView.friends = friends;
    mainView.renderFriends();
});

socket.on("getFriendRequests", (requests) => {
    vars.mainView.requests = requests;
    mainView.renderRequests();
});

socket.on("requestFriend", (from) => {
    uiFunc.uiMsg(translateFunc.get("Friend request from $", apis.www.changeUserID(from)));
    socket.emit("getFriendRequests");
});

socket.on("requestFriendResponse", (from, accept) => {
    if(!accept){
        uiFunc.uiMsg(translateFunc.get("Declined friend request from $", apis.www.changeUserID(from)));
        return;
    }
    uiFunc.uiMsg(translateFunc.get("Accepted friend request from $", apis.www.changeUserID(from)));

    if(vars.chat.to != "main") return;
    socket.emit("getFriends");
});