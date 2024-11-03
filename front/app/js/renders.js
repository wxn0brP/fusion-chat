const navs__priv = document.querySelector("#navs__priv");
const groups__content = document.querySelector("#groups__content");
const navs__user__name = document.querySelector("#navs__user__name");
const navs__user__status = document.querySelector("#navs__user__status");
const userProfileDiv = document.querySelector("#userProfile");
const navs__groups__name = document.querySelector("#navs__groups__name");
const navs__groups__channels = document.querySelector("#navs__groups__channels");
const usersInChatDiv = document.querySelector("#usersInChat");

const friendStatusEnum = {
    NOT_FRIEND: 0,
    IS_FRIEND: 1,
    REQUEST_SENT: 2,
    REQUEST_RECEIVED: 3,
};

const renderFunc = {
    privs(){
        navs__priv.innerHTML = "";

        renderUtils.sortPrivs(vars.privs).forEach((id) => {
            const privDiv = document.createElement("button");
            privDiv.classList.add("priv_chat");
            privDiv.classList.add("btn");
            privDiv.id = "priv_chat_"+id;

            const structDiv = document.createElement("div");

            const profileImg = document.createElement("img");
            profileImg.src = "/api/profileImg?id=" + id;
            structDiv.appendChild(profileImg);

            structDiv.innerHTML += apis.www.changeUserID(id);
            privDiv.appendChild(structDiv);
            navs__priv.appendChild(privDiv);

            privDiv.addEventListener("click", () => {
                coreFunc.changeChat("$"+id);
                setTimeout(() => {
                    renderFunc.privsRead();
                }, 100);
            });
        });
        renderFunc.privsRead();
        coreFunc.markSelectedChat();
    },

    privsRead(){
        vars.privs.forEach((id) => {
            const cl = document.querySelector("#priv_chat_"+id)?.classList;
            if(!cl) return;

            const l = vars.lastMess["$"+id]?.main;
            if(!l) return;
            let unreadPriv = false;

            if(l.read != null && l.mess != null){
                unreadPriv = utils.extractTimeFromId(l.read) < utils.extractTimeFromId(l.mess);
            }else if(l.read == null && l.mess != null){
                unreadPriv = true;
            }

            unreadPriv ? cl.add("unreadPriv") : cl.remove("unreadPriv");
        });
    },

    groups(data){ 
        groups__content.innerHTML = "";
        vars.groups = data;
        data.forEach((group) => {
            const id = group.group;
            const groupDiv = document.createElement("div");
            groupDiv.classList.add("group");
            groupDiv.id = "group_chat_"+id;
            if(group.img){
                groupDiv.innerHTML = `<img src="/userFiles/servers/${id}.png?time=${Date.now()}" alt="${apis.www.changeChat(id)}">`;
            }else{
                groupDiv.innerHTML = apis.www.changeChat(id);
            }
            groups__content.appendChild(groupDiv);

            groupDiv.addEventListener("click", () => {
                coreFunc.changeChat(id, groupDiv);
            });

            contextMenu.menuClickEvent(groupDiv, (e) => {
                contextMenu.server(e, id);
            });
        });
        coreFunc.markSelectedChat();
    },

    localUserProfile(){
        navs__user__name.innerHTML = apis.www.changeUserID(vars.user._id);
        navs__user__status.innerHTML = vars.user.statusText || vars.user.status || "Online";
    },

    userProfile(data){
        if(!data) return;
        const targetIsMe = data._id == vars.user._id;
        const imgLink = "/api/profileImg?id=" + data._id;

        userProfileDiv.innerHTML = `
            <div id="userProfileInfo">
                <img src="${imgLink}" onclick="createMediaPopup('${imgLink}')" alt="User logo">
                <div>
                    <h1>${data.name}</h1>
                    <p>${data.status}${data.statusText ? " | "+data.statusText : ""}</p>
                    <div id="userProfileBtns" style="margin-top: 10px;"></div>
                </div>
            </div>
        `.trim();

        if(!targetIsMe){
            const frinedBtn = document.createElement("button");
            frinedBtn.classList.add("btn");
            let frinedBtnText;
            switch(data.friendStatus){
                case friendStatusEnum.NOT_FRIEND:
                    frinedBtnText = "Add friend";
                    frinedBtn.onclick = () => mainView.addFriend(data._id);
                break;
                case friendStatusEnum.IS_FRIEND:
                    frinedBtnText = "Remove friend";
                    frinedBtn.onclick = () => mainView.removeFriend(data._id);
                break;
                case friendStatusEnum.REQUEST_SENT:
                    frinedBtnText = "Friend request sent (click to cancel)";
                    frinedBtn.onclick = () => mainView.removeFriendRequest(data._id);
                break;
                case friendStatusEnum.REQUEST_RECEIVED:
                    frinedBtnText = "Request received (click to view)";
                    frinedBtn.onclick = () => {
                        coreFunc.changeChat("main");
                        mainView.changeView("requests");
                    }
                break;
            }
            frinedBtn.innerHTML = translateFunc.get(frinedBtnText);
            userProfileDiv.querySelector("#userProfileBtns").appendChild(frinedBtn);
            
            const blockBtn = document.createElement("button");
            blockBtn.classList.add("btn");
            blockBtn.style.marginLeft = "10px";
            blockBtn.innerHTML = translateFunc.get(data.isBlocked ? "Unblock" : "Block");
            blockBtn.onclick = () => {
                data.isBlocked = !data.isBlocked;
                socket.emit("private.block", data._id, data.isBlocked);
            }
            userProfileDiv.querySelector("#userProfileBtns").appendChild(blockBtn);
        }

        renderUtils.initPopup(userProfileDiv);
    },

    serverInit(sid, name, categories, isOwnEmoji){
        navs__groups__name.innerHTML = name;
        const settingsBtn = document.createElement("span");
        settingsBtn.innerHTML = "⚙️";
        settingsBtn.addEventListener("click", () => {
            socket.emit("server.settings.get", sid);
        })
        navs__groups__name.appendChild(settingsBtn);

        const usersDisplayBtn = document.createElement("span");
        usersDisplayBtn.innerHTML = "👥";
        usersDisplayBtn.addEventListener("click", () => {
            renderFunc.usersInChat(vars.servers.users.map(u => u.uid));
        })
        navs__groups__name.appendChild(usersDisplayBtn);

        function buildChannel(channel, root){
            const { name, type, desc, id: cid } = channel;
            const btn = document.createElement("div");
            btn.onclick = () => {
                if(type == "text"){
                    coreFunc.changeChnl(cid);
                }else if(type == "voice"){
                    if(!vars.servers.text.includes(cid)){
                        uiFunc.uiMsg(translateFunc.get("You can't have permission to join this voice channel") + "!");
                        return;
                    }
                    voiceFunc.joinToVoiceChannel(sid+"="+cid);
                }
            };
            btn.id = "channel_"+cid;
            btn.clA("channel_"+type);
    
            let typeEmoticon = "";
            switch(type){
                case "text":
                    typeEmoticon = "📝";
                break;
                case "voice":
                    typeEmoticon = "🎤";
                break;
            }

            btn.innerHTML = typeEmoticon + " | " +name;
            root.appendChild(btn);
            vars.servers.desc[cid] = desc;
        }
    
        function buildCategory(name, channels, root){
            const detail = document.createElement("details");
            detail.open = true;
    
            const summary = document.createElement("summary");
            summary.innerHTML = name;
            detail.appendChild(summary);
    
            channels.forEach(channel => {
                buildChannel(channel, detail);
                if(channel.text) vars.servers.text.push(channel.id);
            });
            root.appendChild(detail);
        }
    
        navs__groups__channels.innerHTML = "";
        if(categories.length === 0 || categories.every(category => category.chnls.length === 0)){
            navs__groups__channels.innerHTML = "No channels in this server";
            vars.chat.chnl = null;
            return;
        }

        vars.servers.text = [];
        vars.servers.desc = {};
        categories.forEach(category => {
            buildCategory(category.name, category.chnls, navs__groups__channels);
        });
    
        catLoop: for(let cat of categories){
            for(let chnl of cat.chnls){
                if(chnl.type == "text"){
                    vars.chat.chnl = chnl.id;
                    break catLoop;
                }
            }
        }

        coreFunc.changeChnl(vars.chat.chnl);

        if(isOwnEmoji){
            const emojiStyle = document.createElement("style");
            emojiStyle.innerHTML = `
                @font-face{
                    font-family: 'emoji';
                    src: url("/userFiles/emoji/${sid}.ttf") format("truetype");
                    font-weight: normal;
                    font-style: normal;
                }
                
                *{
                    font-family: 'emoji', 'Ubuntu', sans-serif;
                }
            `;
            emojiStyleDiv.appendChild(emojiStyle);
        }
    },

    usersInChat(data){
        usersInChatDiv.innerHTML = "";
        const roles = vars.servers.roles;
        const users = vars.servers.users;
        const userColor = new Map();

        function getColor(id){
            if(userColor.has(id)){
                return userColor.get(id);
            }

            const user = users.find(u => u.uid == id);
            if(!user) return;
            if(user.roles.length == 0) return "";

            for(let i=0; i<roles.length; i++){
                if(user.roles.includes(roles[i].name)){
                    const color = roles[i].color;
                    userColor.set(id, color);
                    return color;
                }
            }
            return "";
        }

        data.forEach((userID) => {
            const userDiv = document.createElement("div");

            userDiv.addEventListener("click", () => {
                socket.emit("user.profile", userID);
            });

            const userImg = document.createElement("img");
            userImg.src = "/api/profileImg?id="+userID;
            userDiv.appendChild(userImg);

            const nameDiv = document.createElement("div");
            nameDiv.innerHTML = apis.www.changeUserID(userID);
            nameDiv.style.color = getColor(userID);
            userDiv.appendChild(nameDiv);

            usersInChatDiv.appendChild(userDiv);
        });

        renderUtils.initPopup(usersInChatDiv);
    },
}

const renderUtils = {
    getLastFromChat(obj){
        let latestTime = null;
      
        for(let key in obj){
            if(!obj.hasOwnProperty(key)) continue;
            const id = obj[key];
            const time = utils.extractTimeFromId(id);
    
            if(time !== null && (latestTime === null || time > latestTime)) latestTime = time;
        }
        
        return latestTime;
    },

    sortPrivs(data){
        const sortedData = [...data];
        sortedData.sort((a, b) => {
            const la = vars.lastMess["$"+a]?.main;
            const lb = vars.lastMess["$"+b]?.main;
            if(!la || !lb) return 0;

            return utils.extractTimeFromId(lb.mess) - utils.extractTimeFromId(la.mess);
        });

        return sortedData;
    },

    initPopup(popup){
        if(!popup) return;

        const isAlreadyOpen = popup.getAttribute("opened");
        if(isAlreadyOpen){
            popup.setAttribute("opened", "2");
            return;
        }

        popup.setAttribute("opened", "1");
        popup.fadeIn();

        const closePopup = () => {
            setTimeout(() => {
                const isPopupStillOpen = popup.getAttribute("opened") === "2";
                if(isPopupStillOpen){
                    popup.setAttribute("opened", "1");
                    return;
                }
                popup.fadeOut();
                document.body.removeEventListener("click", closePopup);
                setTimeout(() => {
                    popup.removeAttribute("opened");
                }, 800);
            }, 100);
        };

        setTimeout(() => {
            document.body.addEventListener("click", closePopup);
        }, 100);
    },
}

socket.on("private.get", (data) => {
    data.forEach((priv) => {
        const id = "$"+priv.priv;

        vars.lastMess[id] = vars.lastMess[id] || {};
        vars.lastMess[id].main = {
            read: priv.last?.main ?? null,
            mess: priv.lastMessId ?? null,
        }
    })
    vars.privs = data.map(d => d.priv);
    renderFunc.privs();
});

socket.on("group.get", renderFunc.groups);
socket.on("server.setup", renderFunc.serverInit);
socket.on("user.profile", renderFunc.userProfile);
