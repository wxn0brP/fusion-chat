const { ipcMain } = require('electron');
const createNotif = require("./notif");
const { sendToFront } = require("./utils");

ipcMain.on('electronAPI', async (event, data) => {
    data = JSON.parse(data);
    switch(data.type){
        case "debug":
            lo("from front", data.msg)
        break;
        case "notif":
            if(mainWin.isFocused()) return;
            createNotif(data.title, data.msg, () => {
                const { to, chnl } = data.payload.msg;
                sendToFront({
                    type: "ctrl",
                    ctrl: [["cc", to+"_"+chnl]]
                });
                return true;
            });
        break;
        case "status":
            confArg.rpcAuto = !!data.data;
        break;
    }
});