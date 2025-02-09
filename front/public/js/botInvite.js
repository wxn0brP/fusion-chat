const state = {
    invite: document.querySelector("#state-invite"),
    error: document.querySelector("#state-error"),
    success: document.querySelector("#state-success"),
}

const bid = new URLSearchParams(location.search).get("id");

function redirectToLogin(){
    location.href = "/login?err=true&next=/iv/bot?id=" + bid;
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
    const bot = await fetch("/api/iv/bot/meta?id="+bid, {
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

    changeState("invite");
    document.querySelector("#botName").innerHTML = bot.data.name;

    const realmSelect = document.querySelector("#realmSelect");
    if(!realmSelect) return;
    if(bot.data.realms.length == 0){
        changeState("error");
        state.error.innerHTML = "No available realms to invite";
        return;
    }
    bot.data.realms.forEach(realm => {
        const option = document.createElement("option");
        option.value = realm;
        fetch("/api/id/chat?chat="+realm).then(res => res.json()).then(res => option.innerHTML = res.name);
        realmSelect.appendChild(option);
    });
}

function invite(){
    const realm = document.querySelector("#realmSelect").value;
    if(!realm){
        alert("Select realm");
        return;
    }
    fetch("/api/iv/bot?id="+bid+"&realm="+realm, {
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