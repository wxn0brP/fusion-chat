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

    colorRole(){
        const messages = document.querySelectorAll(".mess_message");
        const roles = vars.servers.roles;
        const users = vars.servers.users;
        const userColor = new Map();

        messages.forEach(mess => {
            const author = mess.querySelector(".mess_from").getAttribute("_author");

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
        mess.querySelector(".mess_from > div").style.color = color;
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