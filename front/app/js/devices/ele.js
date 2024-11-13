apis.api.send = (data) => {
    window.electronAPI.send(JSON.stringify(data));
}

apis.api.receiveMessage = (data) => {
    data = JSON.parse(data);
    switch(data.type){
        case "debug":
            debugFunc.msg(data.msg);
        break;
        case "status":
            if(!vars.settings.desktopHandling) return;
            const state = data.data;
            if(state === "clear"){
                socket.emit("status.activity.remove");
            }else if(typeof state == "object" && !Array.isArray(state)){
                socket.emit("status.activity.set", data.data);
            }
        break;
    }
}

(function init(){
    const div = document.createElement("div");
    div.style.display = "none";
    div.id = "electronApiDiv";
    div.addEventListener("electronAPI", (e) => {
        apis.api.receiveMessage(e.detail);
    });
    document.querySelector("#assets").appendChild(div);

})();

setTimeout(() => {
    apis.api.send({
        type: "status",
        data: vars.settings.desktopHandling
    })
}, 5_000);