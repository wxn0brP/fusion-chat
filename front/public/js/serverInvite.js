const state = {
    join: document.querySelector("#state-join"),
    joined: document.querySelector("#state-joined"),
    error: document.querySelector("#state-error"),
    success: document.querySelector("#state-success"),
}

const gid = new URLSearchParams(location.search).get("id");

function redirectToLogin(){
    location.href = "/login?err=true&next=/serverInvite?id=" + gid;
}

function checkLogin(){
    if(!localStorage.getItem("token")) redirectToLogin();
}

function changeState(stateName){
    state.join.style.display = "none";
    state.joined.style.display = "none";
    state.error.style.display = "none";
    state.success.style.display = "none";
    state[stateName].style.display = "block";
}

async function main(){
    if(!gid){
        changeState("error");
        state.error.innerHTML = "Group not found";
        return;
    }
    checkLogin();
    const group = await fetch("/api/joinGrupMeta?id="+gid, {
        headers: {
            "Content-Type": "application/json",
            "Authorization": localStorage.getItem("token"),
        },
    }).then(res => res.json());

    if(group.err){
        changeState("error");
        state.error.innerHTML = group.msg;
        return;
    }

    switch(group.state){
        case 0:
            changeState("join");
            const data = group.data;
            document.querySelector("#groupName").innerHTML = data.name;
            if(data.img){
                const img = document.querySelector("#groupImg");
                img.src = "/userFiles/servers/" + gid + ".png";
                img.style.display = "block";
            }
        break;
        case 1:
            changeState("joined");
        break;
        case 2:
            changeState("error");
            state.error.innerHTML = "You are banned from this server";
        break;
    }
}

function join(){
    fetch("/api/joinGrup?id="+gid, {
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