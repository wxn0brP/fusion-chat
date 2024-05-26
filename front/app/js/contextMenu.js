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
        if(!utils.ss()){
            div.addEventListener("contextmenu", (e) => {
                e.preventDefault();
                call(e);
                return false;
            });
            return;
        }
        //if mobile
        let time;
        div.addEventListener("dblclick", call);
        div.addEventListener("mousedown", () => time = new Date());
        div.addEventListener("touchstart", () => time = new Date());
        div.addEventListener("touchend", end);
        div.addEventListener("mouseup", end);
        function end(e){
            time = new Date() - time;
            if(time > 1000) setTimeout(() => call(e), 100);
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
                uiFunc.uiMsg("Deleted message!");
            break;
            case "reply":
                vars.temp.replyId = id;
                replyCloseDiv.style.display = "block";
            break;
            case "copy_id":
                navigator.clipboard.writeText(id);
                uiFunc.uiMsg("Copied message ID!");
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