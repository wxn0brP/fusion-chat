const fullscreenWindow = require("./fullscreenWindow");
const { sendToFront } = require("./utils");

const cache = {
    interval: null,
    title: null,
    set: false
}

if(confArg.rpcAuto == undefined) confArg.rpcAuto = false;

async function checkActivity(){
    if(!confArg.rpcAuto) return;

    return await fullscreenWindow().then(title => {
        if(!title || title.trim() == ""){
            if(cache.set){
                cache.set = false;
                sendToFront({
                    type: "status",
                    data: "clear"
                });
                lo("sent idle");
            }
            return;
        }
        if(cache.title == title) return;

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