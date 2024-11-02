messInput.addEventListener("keydown", (e) => {
    if(e.key != "Enter") return;
    if(e.shiftKey) return; //if shift + enter - new line

    e.preventDefault();
    messFunc.sendMess();
});

messInput.addEventListener("keydown", (e) => {
    if(e.key != "ArrowUp" || messInput.value.length > 0) return;
    e.preventDefault();

    const messages = document.querySelectorAll(".mess_message");
    const lastUserMessage = Array.from(messages).reverse().find(message => 
        message.querySelector(".mess_meta").getAttribute("_author") === vars.user._id
    );
    if(!lastUserMessage) return;

    const id = lastUserMessage.id.split("mess__")[1];
    if(!id) return;

    uiFunc.editMess(id);
});

messInput.addEventListener("keydown", (e) => {
    if(e.key != "ArrowDown" || messInput.value.length > 0) return;
    e.preventDefault();

    const lastMessage = document.querySelector(".mess_message:last-child");
    if(!lastMessage) return;

    const id = lastMessage.id.split("mess__")[1];
    if(!id) return;

    vars.temp.replyId = id;
    replyCloseDiv.style.display = "block";
    lastMessage.style.backgroundColor = "var(--panel)";
});

messInput.addEventListener("input", messStyle.sendBtnStyle);
messInput.addEventListener("input", messStyle.messageHeight);

socket.on("mess", (data) => {
    const tom = data.toM.replace("$", "");

    if(!vars.lastMess[tom]) vars.lastMess[tom] = {};
    if(!vars.lastMess[tom][vars.chat.chnl]) vars.lastMess[tom][vars.chat.chnl] = { read: null, mess: null };
    vars.lastMess[tom][vars.chat.chnl].mess = data._id;

    lo(data)
    if(data.to != "@"){
        if(vars.chat.to !== data.to){
            if(data.to.startsWith("$")){
                uiFunc.uiMsg("Recive message from "+apis.www.changeUserID(data.fr));
                if(vars.settings.notifications && Notification.permission === "granted"){
                    const title = "Recive message from "+apis.www.changeUserID(data.fr)
                    const notif = new Notification(title, {
                        body: data.msg,
                        icon: "/favicon.ico",
                    });
                    notif.onclick = () => {
                        window.focus();
                    }
                }
            }
        }
        if(vars.chat.to !== data.to || vars.chat.chnl !== data.chnl){
            renderFunc.privs();
            return;
        }
    }else{
        if(vars.chat.to !== data.toM || vars.chat.chnl !== data.chnl){
            renderFunc.privs();
            return;
        }
    }

    messFunc.addMess(data);
    vars.temp.makeIsRead = data._id;
    setTimeout(() => {
        if(vars.temp.makeIsRead != data._id) return;
        vars.temp.makeIsRead = null;
        socket.emit("message.markAsRead", vars.chat.to, vars.chat.chnl, data._id);
    }, 1000);
    
    vars.lastMess[tom][vars.chat.chnl].read = data._id;
    renderFunc.privs();
    messStyle.hideFromMessageInfo();
    messStyle.colorRole();
});

socket.on("message.fetch", (data) => {
    try{
        data.forEach((mess) => {
            try{
                mess.e = mess.lastEdit ? mess.lastEdit : false;
                mess.reacts = mess.reacts || {};
                messFunc.addMess(mess, false, true);
            }catch(e){
                lo(e);
                lo(mess);
                const div = document.createElement("div");
                div.innerHTML = `<span style="color: red;">Failed to load this message!</span>`;
                messagesDiv.add(div);
            }
        });
        messStyle.hideFromMessageInfo();
        setTimeout(coreFunc.socrollToBottom, 30);
    }catch(e){
        lo(e);
        const div = document.createElement("div");
        div.innerHTML = `<span style="color: red;">"Failed to load the message! :("</span>`;
        messagesDiv.add(div);
    }
    messStyle.colorRole();
});

socket.on("message.delete", (id) => {
    document.querySelector("#mess__"+id)?.remove();
    messStyle.hideFromMessageInfo();
});

socket.on("message.edit", (id, msg, time) => {
    const messageDiv = document.querySelector("#mess__"+id+" .mess_content");
    if(!messageDiv) return;
    messageDiv.setAttribute("_plain", msg);
    format.formatMess(msg, messageDiv);
    messageDiv.innerHTML += editMessText.replace("$$", utils.formatDateFormUnux(parseInt(time, 36)));

    const responeMessages = document.querySelectorAll(`[resMsgID=${id}] .res_msg`);
    responeMessages.forEach(mess => {
        mess.innerHTML = msg;
    });
    messStyle.hideFromMessageInfo();
});

socket.on("message.react", (uid, server, messId, react) => {
    if(vars.chat.to != server) return;
    
    const mess = document.querySelector("#mess__"+messId);
    if(!mess) return;

    const reactSpan = mess.querySelector(`span[_key="${react}"]`);
    if(!reactSpan){
        const span = document.createElement("span");
        span.setAttribute("_key", react);
        span.setAttribute("_users", uid);
        span.innerHTML = react + " 1";
        span.title = apis.www.changeUserID(uid);
        span.addEventListener("click", () => {
            socket.emit("message.react", server, messId, react);
        });
        mess.querySelector(".mess_reacts").appendChild(span);
        messStyle.styleMessReacts(mess.querySelector(".mess_reacts"));
        return;
    }

    let users = reactSpan.getAttribute("_users").split(",");
    if(users.includes(uid)){
        users = users.filter(u => u != uid);
    }else{
        users.push(uid);
    }

    reactSpan.setAttribute("_users", users.join(","));
    messStyle.styleMessReacts(mess.querySelector(".mess_reacts"));
});

socket.on("message.search", (data) => {
    messagesDiv.innerHTML = "<h2>"+translateFunc.get("Search result")+":</h2>";
    if(data.length == 0){
        messagesDiv.innerHTML += "No result found";
        return;
    }

    data.forEach((mess) => {
        messFunc.addMess(mess, false);
    });
});

socket.on("message.fetch.pinned", (data) => {
    vars.chat.pinned = data;
});