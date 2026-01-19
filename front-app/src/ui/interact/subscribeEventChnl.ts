import { apis } from "#api/apis";
import { mglInt } from "#var/mgl";
import { socket } from "#core/socket/socket";
import { Id } from "#types/Id";

export namespace uii_subscribeEventChnl {
    export const popup: HTMLDivElement = document.querySelector("#subscribeEventChnl");
    export const realms: HTMLSelectElement = popup.querySelector("#subscribeEventChnl_realms");
    export const channels: HTMLSelectElement = popup.querySelector("#subscribeEventChnl_channels");
    export const okBtn: HTMLButtonElement = popup.querySelector("#subscribeEventChnl_subscribe");
    export const cancelBtn: HTMLButtonElement = popup.querySelector("#subscribeEventChnl_exit");

    export function loadChannels() {
        const realm = realms.value;
        if (!realm) return;
        channels.innerHTML = "";

        socket.emit("realm.announcement.channel.list", realm, (data) => {
            data.forEach((channel) => {
                const option = document.createElement("option");
                option.value = channel.chid;
                option.innerHTML = channel.name;
                channels.appendChild(option);
            });
        });
    }

    export function show(sourceRealmId: Id, sourceChannelId: Id) {
        realms.innerHTML = "";
        realms.onchange = () => loadChannels();
        socket.emit("realm.announcement.channel.available", async (data) => {
            for (const realm of data) {
                const option = document.createElement("option");
                option.value = realm;
                option.innerHTML = await apis.www.changeChat(realm);
                realms.appendChild(option);
            }
            loadChannels();
        });

        okBtn.onclick = () => {
            const realm = realms.value;
            const channel = channels.value;
            if (realm && channel) {
                socket.emit("realm.announcement.channel.subscribe", sourceRealmId, sourceChannelId, realm, channel);
                popup.fadeOut();
            }
        }

        cancelBtn.onclick = () => {
            popup.fadeOut();
        }

        popup.fadeIn();
    }
}

mglInt.subscribeEventChnl = uii_subscribeEventChnl;