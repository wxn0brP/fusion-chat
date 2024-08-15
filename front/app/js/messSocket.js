messInput.addEventListener("keydown", (e) => {
    //if shift + enter - new line
    if(e.key == "Enter" && e.shiftKey) return;

    if(e.key == "Enter"){
        e.preventDefault();
        messFunc.sendMess();
    }
});

messInput.addEventListener("input", messStyle.sendBtnStyle);

socket.on("mess", (data) => {
    const tom = data.toM.replace("$", "");

    if(!vars.lastMess[tom]) vars.lastMess[tom] = {};
    if(!vars.lastMess[tom][vars.chat.chnl]) vars.lastMess[tom][vars.chat.chnl] = { read: null, mess: null };
    vars.lastMess[tom][vars.chat.chnl].mess = data._id;

    if(data.to != "@"){
        if(vars.chat.to !== data.to){
            if(data.to.startsWith("$")){
                uiFunc.uiMsg("Recive message from "+apis.www.changeUserID(data.fr));
            }
        }
        if(vars.chat.to !== data.to || vars.chat.chnl !== data.chnl){
            renderFunc.privs();
            return;
        }
    }

    messFunc.addMess(data);
    vars.temp.makeIsRead = data._id;
    setTimeout(() => {
        if(vars.temp.makeIsRead != data._id) return;
        vars.temp.makeIsRead = null;
        socket.emit("markAsRead", vars.chat.to, vars.chat.chnl, data._id);
    }, 1000);
    
    vars.lastMess[tom][vars.chat.chnl].read = data._id;
    renderFunc.privs();
    messStyle.hideFromMessageInfo();
    messStyle.colorRole();
});

socket.on("getMess", (data) => {
    try{
        data.forEach((mess) => {
            try{
                messFunc.addMess({
                    fr: mess.fr,
                    msg: mess.msg,
                    _id: mess._id,
                    e: mess.lastEdit ? mess.lastEdit : false,
                    res: mess.res,
                    reacts: mess.reacts || {},
                }, false, true);
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

socket.on("deleteMess", (id) => {
    document.querySelector("#mess__"+id)?.remove();
    messStyle.hideFromMessageInfo();
});

socket.on("editMess", (id, msg, time) => {
    const messageDiv = document.querySelector("#mess__"+id+" .mess_content");
    if(!messageDiv) return;
    messageDiv.setAttribute("_plain", msg);
    format.formatMess(msg, messageDiv);
    messageDiv.innerHTML += editMessText.replace("$$", coreFunc.formatDateFormUnux(parseInt(time, 36)));

    const responeMessages = document.querySelectorAll(`[resMsgID=${id}] .res_msg`);
    responeMessages.forEach(mess => {
        mess.innerHTML = msg;
    });
    messStyle.hideFromMessageInfo();
});

socket.on("reactToMess", (uid, server, messId, react) => {
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
            socket.emit("reactToMess", server, messId, react);
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