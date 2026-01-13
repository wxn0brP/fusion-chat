import { apis } from "#api/apis";
import { mglInt } from "#var/mgl";
import socket from "#core/socket/socket";
import Id from "#types/Id";

class SubscribeEventChnl {
    popup: HTMLDivElement;
    realms: HTMLSelectElement;
    channels: HTMLSelectElement;
    okBtn: HTMLButtonElement;
    cancelBtn: HTMLButtonElement;

    init() {
        this.popup = document.querySelector("#subscribeEventChnl");
        this.realms = this.popup.querySelector("#subscribeEventChnl_realms");
        this.channels = this.popup.querySelector("#subscribeEventChnl_channels");
        this.okBtn = this.popup.querySelector("#subscribeEventChnl_subscribe");
        this.cancelBtn = this.popup.querySelector("#subscribeEventChnl_exit");
    }

    loadChannels() {
        const realm = this.realms.value;
        if (!realm) return;
        const _this = this;
        this.channels.innerHTML = "";

        socket.emit("realm.announcement.channel.list", realm, (data) => {
            data.forEach((channel) => {
                const option = document.createElement("option");
                option.value = channel.chid;
                option.innerHTML = channel.name;
                _this.channels.appendChild(option);
            });
        });
    }

    show(sourceRealmId: Id, sourceChannelId: Id) {
        this.realms.innerHTML = "";
        this.realms.onchange = () => this.loadChannels();
        const _this = this;
        socket.emit("realm.announcement.channel.available", async (data) => {
            for (const realm of data) {
                const option = document.createElement("option");
                option.value = realm;
                option.innerHTML = await apis.www.changeChat(realm);
                _this.realms.appendChild(option);
            }
            this.loadChannels();
        });

        this.okBtn.onclick = () => {
            const realm = this.realms.value;
            const channel = this.channels.value;
            if (realm && channel) {
                socket.emit("realm.announcement.channel.subscribe", sourceRealmId, sourceChannelId, realm, channel);
                this.popup.fadeOut();
            }
        }

        this.cancelBtn.onclick = () => {
            this.popup.fadeOut();
        }

        this.popup.fadeIn();
    }
}

export const subscribeEventChnl = new SubscribeEventChnl();

subscribeEventChnl.init();
mglInt.subscribeEventChnl = subscribeEventChnl;