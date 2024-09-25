const navs__main = document.querySelector("#navs__main");
const navs__groups = document.querySelector("#navs__groups");
const navs__main__call = document.querySelector("#navs__main__call");
const emojiStyleDiv = document.querySelector("#emoji-style");
const messages_nav__server__description = document.querySelector("#messages_nav__server__description");

const coreFunc = {
    changeChat(id, div=null){
        messagesDiv.innerHTML = "";
        coreFunc.markSelectedChat(id);
        emojiStyleDiv.innerHTML = "";
        emojiFunc.customEmojisCat = [];
        emojiFunc.customEmojis = {};

        if(id == "main"){
            vars.chat.to = "main";
            barDiv.style.display = "none";
            document.querySelector("title").innerHTML = vars.baseTitle;

            navs__main.style.display = "block";
            navs__groups.style.display = "none";
            navs__main__call.style.display = "none";
            messages_nav.style.display = "none";
            mainViewDiv.style.display = "";
            messagesDiv.style.display = "none";
            mainView.show();

            return;
        }
        
        setTimeout(() => {
            if(!utils.ss()) return;
            if(id != "main" && !id.startsWith("$")) return;
            document.querySelector("nav").style.left = "-360px";
        }, 300);

        barDiv.style.display = "block";
        messagesDiv.style.display = "";
        messages_nav.style.display = "";
        mainViewDiv.style.display = "none";
        vars.chat.to = id;
        vars.chat.actMess = 0;

        if(id.startsWith("$")){
            document.querySelector("title").innerHTML = vars.baseTitle + " | " + apis.www.changeUserID(id.substring(1));
            navs__main.style.display = "block";
            navs__groups.style.display = "none";
            vars.chat.chnl = "main";
            coreFunc.loadChat();
            socket.emit("message.fetch.pinned", vars.chat.to, vars.chat.chnl);
            vars.servers.users = [];
            vars.servers.roles = [];
            vars.servers.text = [];
            messInput.placeholder = translateFunc.get("Write message here") + "...";
            messInput.disabled = false;
            navs__main__call.style.display = "";
            messages_nav_priv.style.display = "";
            messages_nav_server.style.display = "none";
        }else{
            document.querySelector("title").innerHTML = vars.baseTitle + " | " + apis.www.changeChat(id);
            navs__main.style.display = "none";
            navs__groups.style.display = "block";
            messages_nav_priv.style.display = "none";
            messages_nav_server.style.display = "";
            vars.chat.chnl = null;
            socket.emit("server.setup", id);
            socket.emit("server.roles.sync", id);
        }

        if(div) div.classList.add((id.startsWith("$") ? "priv" : "group") + "_chatActive");
    },

    changeChnl(id){
        vars.chat.chnl = id;
        vars.chat.actMess = 0;

        document.querySelectorAll(".channel_text").forEach(e => e.classList.remove("channel_textActive"));
        document.querySelector("#channel_"+id).classList.add("channel_textActive");
        messages_nav__server__description.innerHTML = vars.servers.desc[id] || "";
        
        coreFunc.loadChat();
        socket.emit("message.fetch.pinned", vars.chat.to, vars.chat.chnl);

        const isText = vars.servers.text.includes(id);
        if(isText){
            messInput.placeholder = translateFunc.get("Write message here") + "...";
            messInput.disabled = false;
        }else{
            messInput.placeholder = translateFunc.get("You can't write in this channel") + "!";
            messInput.disabled = true;
        }
    },

    loadChat(){
        coreFunc.loadMess();
        setTimeout(coreFunc.focusInp, 100);
        setTimeout(() => {
            messagesDiv.scrollTop = messagesDiv.scrollHeight;
        }, 300);
    },

    focusInp(end=false){
        if(utils.ss()) return;
        setTimeout(() => {
            messInput.focus();
            // move cursor to end
            if(end) messInput.selectionStart = messInput.value.length;
        }, 100);
    },

    loadMess(){
        messagesDiv.innerHTML = "";
        const tmp = vars.chat.actMess;
        vars.chat.actMess += vars.messCount;
        if(vars.chat.to == "main") return;

        socket.emit("message.fetch", vars.chat.to, vars.chat.chnl, tmp, vars.chat.actMess);
        socket.emit("message.markAsRead", vars.chat.to, vars.chat.chnl, "last");
    },

    socrollToBottom(){
        if(vars.temp.socrollBlock) return;
        vars.temp.socrollBlock = true;
        setTimeout(() => {
            messagesDiv.scrollTop = messagesDiv.scrollHeight;
        }, 50);
        setTimeout(() => {
            vars.temp.socrollBlock = false;
        }, 300);
    },

    markSelectedChat(){
        document.querySelectorAll(".priv_chat").forEach((ele) => {
            ele.classList.remove("priv_chatActive")
        });
        document.querySelectorAll(".group").forEach((ele) => {
            ele.classList.remove("group_chatActive")
        });
    },

}