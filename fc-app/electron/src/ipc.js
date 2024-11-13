const { ipcMain } = require('electron');
const createNotif = require("./notif");

ipcMain.on('electronAPI', async (event, data) => {
    data = JSON.parse(data);
    switch(data.type){
        case "debug":
            lo("from front", data.msg)
        break;
        case "notif":
            if(mainWin.isFocused()) return;
            createNotif(data.title, data.msg);
        break;
        case "status":
            confArg.rpcAuto = !!data.data;
        break;
    }
});