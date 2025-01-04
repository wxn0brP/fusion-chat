import vars from "../../var/var.js";
import debugFunc from "../../core/debug.js";
import socket from "../../core/socket/socket.js";
import stateManager from "../../ui/helpers/stateManager.js";

export const send = (data) => {
    // @ts-ignore
    window.electronAPI.send(JSON.stringify(data));
}

export const receiveMessage = (data) => {
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
        case "ctrl":
            if(typeof data.ctrl == "object" && !Array.isArray(data.ctrl)) data.ctrl = [data.ctrl];
            const ctrl = data.ctrl.map(c => ({ type: c[0], value: c.slice(1) }));
            stateManager.handleArray(ctrl);
        break;
    }
}

const electronApiDiv = document.createElement("div");
electronApiDiv.style.display = "none";
electronApiDiv.id = "electronApiDiv";
electronApiDiv.addEventListener("electronAPI", (e) => {
    // @ts-ignore
    receiveMessage(e.detail);
});
document.querySelector("#assets").appendChild(electronApiDiv);

setTimeout(() => {
    send({
        type: "status",
        data: vars.settings.desktopHandling
    })
}, 5_000);