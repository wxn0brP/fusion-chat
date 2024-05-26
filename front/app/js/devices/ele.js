apis.api.send = (data) => {
    window.electronAPI.send(JSON.stringify(data));
}

apis.api.receiveMessage = (data) => {
    data = JSON.parse(data);
    switch(data.type){
        case "debug":
            debugFunc.msg(data.msg);
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