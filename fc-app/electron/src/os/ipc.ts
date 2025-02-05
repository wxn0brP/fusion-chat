import { ipcMain } from "electron";
import createNotif from "../utils/notif";
import { sendToFront } from "../utils/utils";
import vars from "../vars";

ipcMain.on("electronAPI", async (event, data) => {
    data = JSON.parse(data);
    switch (data.type) {
        case "debug":
            lo("from front", data.msg)
            break;
        case "notif":
            if (vars.mainWin.isFocused()) return;
            createNotif(data.title, data.msg, async () => {
                const { to, chnl } = data.payload.msg;
                sendToFront({
                    type: "ctrl",
                    ctrl: [["cc", to + "_" + chnl]]
                });
                return true;
            });
            break;
        case "desktopHandling":
            vars.confArg.rpcAuto = data.data;
            break;
    }
});