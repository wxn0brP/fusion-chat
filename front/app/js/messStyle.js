const sendBtnImg = document.querySelector("#barc__sendBtn__img");
const barDiv = document.querySelector("#bar");

const messStyle = {
    sendBtnStyle(){
        const len = messInput.value.trim().length;
        let prop = "";

        if(len == 0) prop = "grey";
        else if(len <= maxMessLen) prop = "green";
        else if(len > maxMessLen) prop = "red";

        sendBtnImg.style.setProperty("--fil", prop);
        sendBtn.disabled = len == 0 || len > maxMessLen;
    },

    messageHeight(){
        let len = messInput.value.split("\n").length-1;
        len = len >= 2 ? Math.min(len, 20) : 0;
        messInput.style.setProperty("--messHeight", len+"rem");
    },

    hideFromMessageInfo(){
        function getTimeFromMess(mess){
            const id = mess.id.replace("mess__", "");
            return utils.extractTimeFromId(id);
        }

        const delayTime = 20; // seconds
        const messages = document.querySelectorAll(".mess_message");
        for(let i=1; i<messages.length; i++){
            const message = messages[i];
            const messageBefore = messages[i-1];

            const messageFrom_author = message.querySelector(".mess_meta").getAttribute("_author");
            const messageBeforeFrom_author = messageBefore.querySelector(".mess_meta").getAttribute("_author");
            if(messageFrom_author != messageBeforeFrom_author) continue;

            const time = getTimeFromMess(message);
            const timeBefore = getTimeFromMess(messageBefore);

            const messageFromText = message.querySelector(".mess_meta");
            messageFromText.style.display = time - timeBefore < delayTime ? "none" : "";
        }
    },

    colorRole(){
        const messages = document.querySelectorAll(".mess_message");
        const roles = vars.servers.roles;
        const users = vars.servers.users;
        const userColor = new Map();

        messages.forEach(mess => {
            const author = mess.querySelector(".mess_meta").getAttribute("_author");

            if(userColor.has(author)){
                messStyle.colorRoleMess(mess, userColor.get(author));
                return;
            }

            const user = users.find(u => u.uid == author);
            if(!user) return;
            if(user.roles.length == 0) return;
            let color;

            for(let i=0; i<roles.length; i++){
                if(user.roles.includes(roles[i].name)){
                    color = roles[i].color;
                    userColor.set(author, color);
                    messStyle.colorRoleMess(mess, color);
                    return;
                }
            }
            messStyle.colorRoleMess(mess, "");
        });
    },

    colorRoleMess(mess, color){
        mess.querySelector(".mess_author_name").style.color = color;
    },

    styleMessReacts(reactsDiv){
        const spans = reactsDiv.querySelectorAll("span");
        spans.forEach(span => {
            const users = span.getAttribute("_users").split(",");

            if(users.length == 0 || users[0] == ""){
                span.remove();
                return;
            }

            span.classList.remove("userReacted");
            if(users.includes(vars.user._id)){
                span.classList.add("userReacted");
            }

            span.title = users.map(u => apis.www.changeUserID(u)).join(", ");
            span.innerHTML = span.getAttribute("_key") + " " + users.length;
        });
    }
}

setTimeout(() => {
    messStyle.sendBtnStyle();
    messStyle.messageHeight();
}, 100); // Delay of 100ms to accommodate any cached input values in the browser