import fileFunc from "#api/file";
import globalExpose from "#bus";
import barView, { maxMessLen } from "#components/app/bar.view";
import socket from "#socket";
import { $store } from "#store";
import { Api_fileFunc_read__options } from "#types/api";
import { Core_mess__sendMessage } from "#types/core/mess";

export function sendMessage() {
    const chatId = $store.chat.id.get();
    const chnlId = $store.chat.chnl.get();

    if (chatId === "main") return;

    const message = barView.input.value.trim();
    if (!message) return;
    if (message.length > maxMessLen) return;

    const data: Core_mess__sendMessage = {
        to: chatId,
        chnl: chnlId,
        msg: message,
    }

    socket.emit("mess", data);

    barView.input.value = "";
    barView.messageHeight();
    barView.sendBtnStyle();
    barView.focusInput();
}

export function sendFile(f: File | undefined) {
    // TODO add check permissions about sending files
    if (f) {
        read(f);
    } else {
        const input = document.createElement("input");
        input.type = "file";
        input.click();
        input.addEventListener("change", (e: Event) => {
            const target = e.target as HTMLInputElement;
            const file = target.files?.[0];
            if (file) {
                read(file);
            } else {
                console.error("No file selected.");
            }
        });
    }

    function read(f: File) {
        const opt: Api_fileFunc_read__options = {
            file: f,
            callback: (xhr: XMLHttpRequest) => {
                const path = JSON.parse(xhr.responseText).path;
                const mess = location.origin + path;

                const data = {
                    to: $store.chat.id.get(),
                    chnl: $store.chat.chnl.get(),
                    msg: mess,
                }
                socket.emit("mess", data);
            },
            maxSize: 8 * 1024 * 1024,
            maxName: 60,
            endpoint: "/api/file/upload"
        }

        fileFunc.read(opt);
    }
}

globalExpose("mess", "send", sendMessage);
globalExpose("mess", "sendFile", sendFile);