const messagesDiv = document.querySelector("#messages");
const messInput = document.querySelector("#mess-input");
const replyCloseDiv = document.querySelector("#replyClose");
const editCloseDiv = document.querySelector("#editClose");
const sendBtn = document.querySelector("#barc__sendBtn");
const emocjiDiv = document.querySelector("#emocjiDiv");
const linkClickDiv = document.querySelector("#linkClick");
const messages_nav = document.querySelector("#messages_nav");
const messages_nav_priv = document.querySelector("#messages_nav__priv");
const messages_nav_server = document.querySelector("#messages_nav__server");

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
            const exitCode = messCmd.send(data);
            if(exitCode == 0) socket.emit("mess", data);
        }else{
            socket.emit("message.edit", vars.chat.to, vars.temp.editId, mess);
            messFunc.editMessClose();
        }
        messInput.value = "";
        messFunc.replyClose();
        coreFunc.focusInp();
        messStyle.sendBtnStyle();
    },

    addMess(data, socroll=true, up=false){
        if(!data) return;

        /*
            .mess_message #mess__$id
                .mess_meta attr: _author
                    img
                    .mess_meta_text
                        span.mess_author_name
                        span.mess_time
                .mess_content attr: _plain
        */

        const messDiv = document.createElement("div");
        messDiv.classList.add("mess_message");
        messDiv.id = "mess__"+data._id;
        if(data.res) messDiv.setAttribute("resMsgID", data.res);

        const fromDiv = document.createElement("div");
        fromDiv.classList.add("mess_meta");
        fromDiv.setAttribute("_author", data.fr);

        const fromDivImg = document.createElement("img");
        fromDivImg.src = "/profileImg?id=" + data.fr;
        fromDiv.appendChild(fromDivImg);

        const fromDivText = document.createElement("div");
        fromDivText.classList.add("mess_meta_text");

        const fromDivTextName = document.createElement("span");
        fromDivTextName.innerHTML = apis.www.changeUserID(data.fr);
        fromDivTextName.classList.add("mess_author_name");
        fromDivTextName.addEventListener("click", () => {
            socket.emit("user.profile", data.fr);
        });
        fromDivText.appendChild(fromDivTextName);

        const timeDiv = document.createElement("span");
        timeDiv.classList.add("mess_time");
        timeDiv.innerHTML = utils.formatDateFormUnux(utils.extractTimeFromId(data._id));
        fromDivText.appendChild(timeDiv);

        fromDiv.appendChild(fromDivText);
        messDiv.appendChild(fromDiv);

        const messContentDiv = document.createElement("div");
        messContentDiv.classList.add("mess_content");
        format.formatMess(data.msg, messContentDiv);
        messContentDiv.setAttribute("_plain", data.msg);
        messDiv.appendChild(messContentDiv);
        if(data.e){
            messContentDiv.innerHTML += editMessText.replace("$$", utils.formatDateFormUnux(parseInt(data.e, 36)));
        }

        if(data.reacts){
            const reactsDiv = document.createElement("div");
            reactsDiv.classList.add("mess_reacts");

            const keys = Object.keys(data.reacts);
            for(let key of keys){
                const users = data.reacts[key];
                const span = document.createElement("span");
                span.setAttribute("_key", key);
                span.setAttribute("_users", users.join(","));
                span.addEventListener("click", () => {
                    socket.emit("message.react", vars.chat.to, data._id, key);
                });
                reactsDiv.appendChild(span);
            }

            messStyle.styleMessReacts(reactsDiv);
            messDiv.appendChild(reactsDiv);
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
        messInput.value = "";
        vars.temp.editId = null;
        coreFunc.focusInp();
    },

    linkClick(e){
        e.preventDefault();
        const url = e.target.getAttribute("href");
        if(!url) return;

        const urlParts = url.split("/");
        const urlClored =
            urlParts[0] + "//" +
            "<span>" + urlParts[2] + "</span>" +
            "/" + urlParts.slice(3).join("/")
        
        linkClickDiv.fadeIn();
        linkClickDiv.querySelector("#linkClick_link").innerHTML = urlClored;
        linkClickDiv.querySelector("#linkClick_yes").addEventListener("click", () => {
            window.open(url, "_blank");
        })
    },

    emocjiPopup(cb){
        emocjiDiv.fadeIn();
        function evt(e){
            cb(e.detail);
            emocjiDiv.removeEventListener("emocji", evt);
            emocjiDiv.fadeOut();
        }
        setTimeout(() => {
            emocjiDiv.addEventListener("emocji", evt);
        }, 100);
    },

    emocji(){
        messFunc.emocjiPopup((emoticon) => {
            messFunc.handleEmocji(emoticon);
            setTimeout(() => {
                messInput.selectionStart = messInput.value.length;
            }, 100);
        });
    },

    handleEmocji(e){
        if(!e) return;
        messInput.value += e;
    },

    sendFile(f){
        if(f){
            read(f);
        }else{
            const input = document.createElement("input");
            input.type = "file";
            input.click();
            input.addEventListener("change", e => read(e.target.files[0]));
        }

        function read(f){
            const opt = {
                file: f,
                callback: (xhr) => {
                    const path = JSON.parse(xhr.responseText).path;
                    const mess = location.origin + path;
                    
                    const data = {
                        to: vars.chat.to,
                        chnl: vars.chat.chnl,
                        msg: mess,
                    }
                    socket.emit("mess", data);
                },
                maxSize: 8*1024*1024,
                maxName: 60,
                endpoint: "/uploadFile"
            }

            fileFunc.read(opt);
        }
    },

    search(){
        messInput.value = "/search ";
        messCmd.selectedCmd = messCmds.system.search;

        const evt = new Event("input");
        messInput.dispatchEvent(evt);

        messCmd.handleCommandInput(
            barc__commads,
            "search",
            messCmd.selectedCmd
        );
    },
}

messFunc.replyClose();