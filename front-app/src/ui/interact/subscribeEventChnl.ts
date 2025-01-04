import hub from "../../hub.js";
hub("interact/subscribeEventChnl");

import socket from "../../core/socket/socket.js";
import apis from "../../api/apis.js";
import { mglInt } from "../../var/html.js";

const subscribeEventChnl = {
    popup: document.querySelector("#subscribeEventChnl"),

    init(){
        const p = this.popup;
        this.realms = p.querySelector("#subscribeEventChnl_realms");
        this.channels = p.querySelector("#subscribeEventChnl_channels");
        this.okBtn = p.querySelector("#subscribeEventChnl_subscribe");
        this.cancelBtn = p.querySelector("#subscribeEventChnl_exit");
    },

    loadChannels(){
        const realm = this.realms.value;
        if(!realm) return;
        const _this = this;
        this.channels.innerHTML = "";

        socket.emit("realm.event.channel.list", realm, (data) => {
            data.forEach((channel) => {
                const option = document.createElement("option");
                option.value = channel.chid;
                option.innerHTML = channel.name;
                _this.channels.appendChild(option);
            });
        });
    },

    show(sourceRealmId, sourceChannelId){
        this.realms.innerHTML = "";
        this.realms.onchange = () => this.loadChannels();
        const _this = this;
        socket.emit("realm.event.channel.available", (data) => {
            data.forEach((realm) => {
                const option = document.createElement("option");
                option.value = realm;
                option.innerHTML = apis.www.changeChat(realm);
                _this.realms.appendChild(option);
            });
            this.loadChannels();
        });
        
        this.okBtn.onclick = () => {
            const realm = this.realms.value;
            const channel = this.channels.value;
            if(realm && channel){
                socket.emit("realm.event.channel.subscribe", sourceRealmId, sourceChannelId, realm, channel);
                this.popup.fadeOut();
            }
        }

        this.cancelBtn.onclick = () => {
            this.popup.fadeOut();
        }

        this.popup.fadeIn();
    }
}
subscribeEventChnl.init();
export default subscribeEventChnl;
mglInt.subscribeEventChnl = subscribeEventChnl;