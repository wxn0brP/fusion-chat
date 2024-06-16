const messagesDiv = document.querySelector("#messages");
const messInput = document.querySelector("#mess-input");
const barDiv = document.querySelector("#bar");
const replyCloseDiv = document.querySelector("#replyClose");
const editCloseDiv = document.querySelector("#editClose");
const sendBtn = document.querySelector("#barc__sendBtn");
const sendBtnImg = document.querySelector("#barc__sendBtn__img");
const emocjiDiv = document.querySelector("#emocjiDiv");

const maxMessLen = 2000; 
const editMessText = `<span class="editMessText noneselect" title="edit $$">(edit)</span>`;

const messFunc = {
    sendMess(){
        if(!vars.chat.to || !vars.chat.chnl) return;
        if(vars.chat.to == "main") return;

        const mess = messInput.value.trim();
        if(!mess) return;
        if(mess.length > maxMessLen) return;

        if(!vars.temp.editId){
            const data = {
                to: vars.chat.to,
                chnl: vars.chat.chnl,
                msg: mess,
                res: vars.temp.replyId,
            }
            socket.emit("mess", data);
        }else{
            socket.emit("editMess", vars.chat.to, vars.temp.editId, mess);
            messFunc.editMessClose();
        }
        messInput.value = "";
        messFunc.replyClose();
        coreFunc.focusInp();
        messFunc.sendBtnStyle();
    },

    addMess(data, socroll=true, up=false){
        if(!data) return;

        /*
            .mess_message #mess__$id
                .mess_from
                .mess_content attr: _plain
        */

        const messDiv = document.createElement("div");
        messDiv.classList.add("mess_message");
        messDiv.id = "mess__"+data._id;
        if(data.res) messDiv.setAttribute("resMsgID", data.res);

        const fromDiv = document.createElement("div");
        fromDiv.classList.add("mess_from");
        const fromDivSpan = document.createElement("span");
        fromDivSpan.innerHTML = apis.www.changeUserID(data.fr);
        fromDivSpan.addEventListener("click", () => {
            socket.emit("userProfile", data.fr);
        });
        fromDiv.appendChild(fromDivSpan);
        messDiv.appendChild(fromDiv);

        const messContentDiv = document.createElement("div");
        messContentDiv.classList.add("mess_content");
        format.formatMess(data.msg, messContentDiv);
        messContentDiv.setAttribute("_plain", data.msg);
        messDiv.appendChild(messContentDiv);
        if(data.e){
            messContentDiv.innerHTML += editMessText.replace("$$", coreFunc.formatDateFormUnux(parseInt(data.e, 36)));
        }

        up ? messagesDiv.addUp(messDiv) : messagesDiv.add(messDiv);

        setTimeout(() => {
            const errMargin = 70; // (px)
            const isScrollAtBottom = messagesDiv.scrollTop + messagesDiv.clientHeight + messDiv.clientHeight + errMargin >= messagesDiv.scrollHeight;
            if(data.res) format.responeMess(data.res, messDiv);
            if(socroll && isScrollAtBottom){
                messDiv.scrollIntoView({behavior: "smooth"});
            }
        }, 100);

        contextMenu.menuClickEvent(messDiv, (e) => {
            contextMenu.message(e, data._id);
        });
    },

    replyClose(){
        replyCloseDiv.style.display = "none";
        vars.temp.replyId = null;
    },

    editMessClose(){
        editCloseDiv.style.display = "none";
        messInput.value = "";elements
        vars.temp.editId = null;
        coreFunc.focusInp();
    },

    sendBtnStyle(){
        const len = messInput.value.trim().length;
        let prop = "";

        if(len == 0) prop = "grey";
        else if(len <= maxMessLen) prop = "green";
        else if(len > maxMessLen) prop = "red";

        sendBtnImg.style.setProperty("--fil", prop);
        sendBtn.disabled = len == 0 || len > maxMessLen;
    },

    emocji(){
        emocjiDiv.fadeIn();
        function end(){
            document.removeEventListener("click", end);
            messFunc.handleEmocji("");
        }
        setTimeout(() => {
            document.addEventListener("click", end);
        }, 100);
    },

    handleEmocji(e){
        emocjiDiv.fadeOut();
        messInput.value += e;
    },

    hideFromMessageInfo(){
        function getTimeFromMess(mess){
            const id = mess.id.replace("mess__", "");
            return parseInt(id.split("-")[0], 36);
        }

        const delayTime = 20 * 1000; // 20 seconds
        const messages = document.querySelectorAll(".mess_message");
        for(let i=1; i<messages.length; i++){
            const message = messages[i];
            const messageBefore = messages[i-1];

            const messageFrom = message.querySelector(".mess_from");
            const messageBeforeFrom = messageBefore.querySelector(".mess_from");
            if(messageFrom.innerText != messageBeforeFrom.innerText) continue;

            const time = getTimeFromMess(message);
            const timeBefore = getTimeFromMess(messageBefore);
            messageFrom.style.display = time - timeBefore < delayTime ? "none" : "block";
        }
    },
}

messFunc.replyClose();

messInput.addEventListener("keydown", (e) => {
    //if shift + enter - new line
    if(e.key == "Enter" && e.shiftKey) return;

    if(e.key == "Enter"){
        e.preventDefault();
        messFunc.sendMess();
    }
});

messInput.addEventListener("input", messFunc.sendBtnStyle);

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
    messFunc.hideFromMessageInfo();
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
                    res: mess.res
                }, false, true);
            }catch(e){
                lo(e);
                lo(mess);
                const div = document.createElement("div");
                div.innerHTML = `<span style="color: red;">Failed to load this message!</span>`;
                messagesDiv.add(div);
            }
        });
        messFunc.hideFromMessageInfo();
        setTimeout(coreFunc.socrollToBottom, 30);
    }catch(e){
        lo(e);
        const div = document.createElement("div");
        div.innerHTML = `<span style="color: red;">"Failed to load the message! :("</span>`;
        messagesDiv.add(div);
    }
});

socket.on("deleteMess", (id) => {
    document.querySelector("#mess__"+id)?.remove();
    messFunc.hideFromMessageInfo();
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
    messFunc.hideFromMessageInfo();
});

(function initEmocji(){
    const emoticonMenu = document.querySelector("#emocjiDiv_container");

    const emotkiUnicode = [
        [128512, 128591],
        // [127744, 127884],
        // [128640, 128704],
        // [127462, 127487],
        // [9728, 9983],
        // [9984, 10175]
    ];

    emotkiUnicode.forEach(range => {
        for(let i = range[0]; i <= range[1]; i++){
            const emoticon = String.fromCodePoint(i);
            const div = document.createElement('div');
            div.textContent = emoticon;
            div.className = 'emocji';
            div.onclick = () => messFunc.handleEmocji(emoticon);
            emoticonMenu.appendChild(div);
        }
    });
})();
