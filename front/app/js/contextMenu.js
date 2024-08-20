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
                socket.emit("deleteMess", vars.chat.to, id);
            break;
            case "reply":
                vars.temp.replyId = id;
                replyCloseDiv.style.display = "block";
            break;
            case "copy_id":
                navigator.clipboard.writeText(id);
                uiFunc.uiMsg("Copied message ID!");
            break;
            case "add_reaction":
                messFunc.emocjiPopup((e) => {
                    if(!e) return;
                    socket.emit("reactToMess", vars.chat.to, id, e);
                });
            break;
        }
    },

    server(type){
        const id = document.querySelector("#server_context_menu").getAttribute("_id");
        switch(type){
            case "copy_id":
                navigator.clipboard.writeText(id);
                uiFunc.uiMsg("Copied server ID!");
            break;
            case "copy_invite":
                // socket.emit("getInviteLink", id);
                const link = location.protocol + "//" + location.host + "/serverInvite?id=" + id;
                navigator.clipboard.writeText(link);
                uiFunc.uiMsg("Copied invite link!");
            break;
            case "exit":
                const conf = confirm("Are you sure you want to exit server?");
                if(conf){
                    socket.emit("exitGroup", id);
                    setTimeout(() => {
                        socket.emit("getGroups");
                    }, 1500);
                }
            break;
        }
    }
}