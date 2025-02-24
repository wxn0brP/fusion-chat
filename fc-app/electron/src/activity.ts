import fullscreenWindow from "./os/fullscreenWindow";
import { sendToFront } from "./utils/utils";
import vars from "./vars";

const { getCurrentWindow } = fullscreenWindow;

const cache = {
    interval: null,
    title: null,
    set: false
}

if (vars.confArg.rpcAuto == undefined) vars.confArg.rpcAuto = false;

async function checkActivity() {
    if (!vars.confArg.rpcAuto) return;

    return await getCurrentWindow().then(title => {
        if (!title || title.trim() == "") {
            if (cache.set) {
                cache.set = false;
                sendToFront({
                    type: "status",
                    data: "clear"
                });
                lo("sent idle");
            }
            return;
        }
        if (cache.title == title) return;

        cache.title = title;
        sendToFront({
            type: "status",
            data: {
                state: "fullscreen",
                name: title,
                endTime: Date.now() + 30_000 // 30s
            }
        });
        cache.set = true;
        lo("sent fullscreen", title);
    });
}

checkActivity().then(() => {
    cache.interval = setInterval(checkActivity, 30_000);
}).catch(err => {
    console.error(err);
})