const contextMenu = {
    _ClassAtrib(e, ele, id){
        ele.setAttribute("_id", id);
        return menuUtil.menuShower(ele, e);
    },

    message(e, id){
        const ele = document.querySelector("#mesage_context_menu");
        this._ClassAtrib(e, ele, id);
    },

    server(e, id){
        const ele = document.querySelector("#server_context_menu");
        this._ClassAtrib(e, ele, id);
    },

    menuClickEvent(div, call){
        if(!utils.isMobile()){
            div.addEventListener("contextmenu", (e) => {
                e.preventDefault();
                call(e);
                return false;
            });
            return;
        }
    
        let time;
        let holdTimeout;
    
        div.addEventListener("mousedown", startHold);
        div.addEventListener("touchstart", startHold);
    
        div.addEventListener("mouseup", cancelHold);
        div.addEventListener("touchend", cancelHold);
    
        function startHold(e){
            time = new Date();
            if(e.type === "touchstart"){
                e.clientX = e.touches[0].clientX;
                e.clientY = e.touches[0].clientY;
            }
            holdTimeout = setTimeout(() => {
                call(e);
            }, 700);
        }
    
        function cancelHold(e){
            clearTimeout(holdTimeout);
            time = new Date() - time;
            if(time < 1000){
                return;
            }
            e.preventDefault();
            return false;
        }
    }
}

const contextFunc = {
    message(type){
        const id = document.querySelector("#mesage_context_menu").getAttribute("_id");
        switch(type){
            case "copy":
                const message = document.querySelector("#mess__"+id+" .mess_content").getAttribute("_plain");
                navigator.clipboard.writeText(message);
                uiFunc.uiMsg("Copied message!");
            break;
            case "edit":
                uiFunc.editMess(id);
            break;
            case "delete":
                if(!confirm("Are you sure you want to delete this message?")) return;
                socket.emit("message.delete", vars.chat.to, id);
            break;
            case "reply":
                vars.temp.replyId = id;
                replyCloseDiv.style.display = "block";
                document.querySelector("#mess__"+id).style.backgroundColor = "var(--panel)";
            break;
            case "copy_id":
                navigator.clipboard.writeText(id);
                uiFunc.uiMsg("Copied message ID!");
            break;
            case "add_reaction":
                messFunc.emocjiPopup((e) => {
                    if(!e) return;
                    socket.emit("message.react", vars.chat.to, id, e);
                });
            break;
            case "pin":
                socket.emit("message.pin", vars.chat.to, vars.chat.chnl, id, true);
            break;
            case "unpin":
                socket.emit("message.pin", vars.chat.to, vars.chat.chnl, id, false);
            break;
        }
    },

    server(type){
        const id = document.querySelector("#server_context_menu").getAttribute("_id");
        switch(type){
            case "copy_id":
                navigator.clipboard.writeText(id);
                uiFunc.uiMsg(translateFunc.get("Copied server ID") + "!");
            break;
            case "copy_invite":
                // socket.emit("getInviteLink", id);
                const link = location.protocol + "//" + location.host + "/serverInvite?id=" + id;
                navigator.clipboard.writeText(link);
                uiFunc.uiMsg(translateFunc.get("Copied invite link") + "!");
            break;
            case "exit":
                const conf = confirm(translateFunc.get("Are you sure you want to exit server$($)", "? ", apis.www.changeChat(id)));
                if(conf){
                    socket.emit("group.exit", id);
                    coreFunc.changeChat("main");
                }
            break;
            case "mute":
                const group = vars.groups.find(g => g.group == id);
                if(!group) return;

                let muted = false;
                if(group.muted != undefined){
                    if(group.muted == -1){
                        muted = false;
                    }else if(group.muted == 0){
                        muted = true;
                    }else if(group.muted > new Date().getTime()){
                        muted = true;
                        endTime = new Date(group.muted).toLocaleString();
                    }else{
                        muted = false;
                    }
                }

                const muteStatus = muted ? translateFunc.get("muted") : translateFunc.get("unmuted");
                let endTimeText = '';

                if(muted){
                    if(group.muted === 0){
                        endTimeText = translateFunc.get("Mute is permanent");
                    }else if(group.muted > new Date().getTime()){
                        const endTime = new Date(group.muted).toLocaleString();
                        endTimeText = translateFunc.get("Mute ends at $", endTime);
                    }
                }

                const text = `
                    ${translateFunc.get("Mute server ($)", apis.www.changeChat(id))}
                    <br />
                    ${translateFunc.get("Status")}: ${muteStatus}
                    ${endTimeText ? "<br />" + endTimeText : ''}
                `;

                uiFunc.selectPrompt(
                    text,
                    [
                        translateFunc.get("15 minutes"),
                        translateFunc.get("1 hour"),
                        translateFunc.get("1 day"),
                        translateFunc.get("Permanently"),
                        translateFunc.get("Unmute"),
                        translateFunc.get("Cancel")
                    ],
                    ["15m", "1h", "1d", "forever", "unmute", "cancel"]
                ).then(value => {
                    if (!value) return;

                    const now = new Date();
                    let targetTime = -1;
                    switch (value) {
                        case "15m":
                            now.setMinutes(now.getMinutes() + 15);
                            targetTime = now.getTime();
                        break;
                        case "1h":
                            now.setHours(now.getHours() + 1);
                            targetTime = now.getTime();
                        break;
                        case "1d":
                            now.setDate(now.getDate() + 1);
                            targetTime = now.getTime();
                        break;
                        case "forever":
                            targetTime = 0;
                        break;
                        case "unmute":
                            targetTime = -1;
                        break;
                        case "cancel":
                            return;
                    }

                    socket.emit("group.mute", id, targetTime);
                    group.muted = targetTime;
                });
            break;
        }
    }
}