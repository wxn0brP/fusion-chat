const state = {
    invite: document.querySelector("#state-invite"),
    error: document.querySelector("#state-error"),
    success: document.querySelector("#state-success"),
}

const bid = new URLSearchParams(location.search).get("id");

function redirectToLogin(){
    location.href = "/login?err=true&next=/botInvite?id=" + bid;
}

function checkLogin(){
    if(!localStorage.getItem("token")) redirectToLogin();
}

function changeState(stateName){
    state.invite.style.display = "none";
    state.error.style.display = "none";
    state.success.style.display = "none";
    state[stateName].style.display = "block";
}

async function main(){
    if(!bid){
        changeState("error");
        state.error.innerHTML = "Bot not found";
        return;
    }
    checkLogin();
    const bot = await fetch("/api/botInviteMeta?id="+bid, {
        headers: {
            "Content-Type": "application/json",
            "Authorization": localStorage.getItem("token"),
        },
    }).then(res => res.json());

    if(bot.err){
        changeState("error");
        state.error.innerHTML = bot.msg;
        return;
    }

    switch(bot.state){
        case 0:
            changeState("invite");
            document.querySelector("#botName").innerHTML = bot.data.name;

            const serverSelect = document.querySelector("#serverSelect");
            bot.data.servers.forEach(server => {
                const option = document.createElement("option");
                option.value = server;
                fetch("/api/chatId?chat="+server).then(res => res.json()).then(res => option.innerHTML = res.name);
                serverSelect.appendChild(option);
            });
        break;
    }
}

function invite(){
    const server = document.querySelector("#serverSelect").value;
    if(!server){
        alert("Select server");
        return;
    }
    fetch("/api/botInvite?id="+bid+"&server="+server, {
        headers: {
            "Content-Type": "application/json",
            "Authorization": localStorage.getItem("token"),
        },
    }).then(res => res.json()).then(res => {
        if(res.err){
            changeState("error");
            state.error.innerHTML = res.msg;
            return;
        }

        changeState("success");
    });
}

main();