const navs__priv = document.querySelector("#navs__priv");
const groups__content = document.querySelector("#groups__content");
const navs__user__name = document.querySelector("#navs__user__name");
const navs__user__status = document.querySelector("#navs__user__status");
const userProfileDiv = document.querySelector("#userProfile");
const navs__groups__name = document.querySelector("#navs__groups__name");
const navs__groups__channels = document.querySelector("#navs__groups__channels");
const usersInChatDiv = document.querySelector("#usersInChat");

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
            profileImg.src = "/profileImg?id=" + id;
            structDiv.appendChild(profileImg);

            structDiv.innerHTML += apis.www.changeUserID(id);
            privDiv.appendChild(structDiv);
            navs__priv.appendChild(privDiv);

            privDiv.addEventListener("click", () => {
                coreFunc.changeChat("$"+id, privDiv);
                renderFunc.privsRead();
            });
        });
        renderFunc.privsRead();
    },

    privsRead(){
        vars.privs.forEach((id) => {
            const cl = document.querySelector("#priv_chat_"+id)?.classList;
            if(!cl) return;

            const l = vars.lastMess[id]["main"];
            if(
                l.read != null && l.mess != null &&
                renderUtils.changeIdToTime(l.read) < renderUtils.changeIdToTime(l.mess)
            ){
                cl.add("unreadPriv");
            }else{
                cl.remove("unreadPriv");
            }
        });
    },

    groups(data){ 
        groups__content.innerHTML = "";
        data.forEach((group) => {
            const id = group.group;
            const groupDiv = document.createElement("div");
            groupDiv.classList.add("group");
            groupDiv.id = "group_chat_"+id;
            groupDiv.innerHTML = apis.www.changeChat(id);
            groups__content.appendChild(groupDiv);

            groupDiv.addEventListener("click", () => {
                coreFunc.changeChat(id, groupDiv);
            });

            contextMenu.menuClickEvent(groupDiv, (e) => {
                contextMenu.server(e, id);
            });
        });
    },

    localUserProfile(){
        navs__user__name.innerHTML = vars.user.fr;
        navs__user__status.innerHTML = vars.user.statusText || vars.user.status || "Online";
    },

    userProfile(data){
        if(!data) return;

        userProfileDiv.innerHTML = `
            <img src="/profileImg?id=${data._id}" alt="User logo">
            <h1>${data.name}</h1>
            <p>${data.status}${data.statusText ? " | "+data.statusText : ""}</p>
        `.trim();

        const isFriend = vars.mainView.friends.find(f => f._id == data._id);
        if(isFriend){
            userProfileDiv.innerHTML += `
                <button class="profile__btn" onclick="mainView.removeFriend('${data._id}')">Remove friend</button>
            `.trim();
        }else{
            userProfileDiv.innerHTML += `
                <button class="profile__btn" onclick="mainView.addFriend('${data._id}')">Add friend</button>
            `.trim();
        }

        renderUtils.initPopup(userProfileDiv);
    },

    serverInit(sid, name, categories){
        navs__groups__name.innerHTML = name;
        const settingsBtn = document.createElement("span");
        settingsBtn.innerHTML = "⚙️";
        settingsBtn.addEventListener("click", () => {
            socket.emit("getSeverSettings", sid);
        })
        navs__groups__name.appendChild(settingsBtn);

        const usersDisplayBtn = document.createElement("span");
        usersDisplayBtn.innerHTML = "👥";
        usersDisplayBtn.addEventListener("click", () => {
            renderFunc.usersInChat(vars.servers.users.map(u => u.uid));
        })
        navs__groups__name.appendChild(usersDisplayBtn);

        function buildChannel(name, cid, type, root){
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
        }
    
        function buildCategory(name, channels, root){
            const detail = document.createElement("details");
            detail.open = true;
    
            const summary = document.createElement("summary");
            summary.innerHTML = name;
            detail.appendChild(summary);
    
            channels.forEach(channel => {
                buildChannel(channel.name, channel.id, channel.type, detail);
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
                socket.emit("userProfile", userID);
            });

            const userImg = document.createElement("img");
            userImg.src = "/profileImg?id="+userID;
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
    changeIdToTime(id){
        if(!id) return null;
        const timePart = id.split("-")[0];
        return parseInt(timePart, 36);
    },

    getLastFromChat(obj){
        let latestTime = null;
      
        for(let key in obj){
            if(!obj.hasOwnProperty(key)) continue;
            const id = obj[key];
            const time = this.changeIdToTime(id);
    
            if(time !== null && (latestTime === null || time > latestTime)) latestTime = time;
        }
        
        return latestTime;
    },

    sortPrivs(data){
        const sortedData = [...data];
        sortedData.sort((a, b) => {
            const la = vars.lastMess[a]["main"];
            const lb = vars.lastMess[b]["main"];

            return this.changeIdToTime(lb.mess) - this.changeIdToTime(la.mess);
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


socket.on("getGroups", (data) => renderFunc.groups(data));

socket.on("getPrivs", (data) => {
    data.forEach((priv) => {
        const id = priv.priv;

        if(!vars.lastMess[id]) vars.lastMess[id] = {};
        if(!priv.last){
            priv.last = { main: null }
        }
        if(!priv.lastMessId){
            priv.lastMessId = null;
        }
        vars.lastMess[id]["main"] = {
            read: priv.last.main,
            mess: priv.lastMessId
        }
    })
    vars.privs = data.map(d => d.priv);
    renderFunc.privs();
});

socket.on("setUpServer", (...data) => renderFunc.serverInit(...data));