import { Notification } from "electron";
import vars from "../vars";

function createNotif(title: string, body: string, callback: () => Promise<boolean | void>) {
    const notif = new Notification({
        title,
        body,
        icon: "favicon.png"
    });
    notif.on("click", async () => {
        if (callback) {
            const res = await callback();
            if (!res) return;
        }
        if (vars.mainWin.isMinimized()) {
            vars.mainWin.restore();
        }
        vars.mainWin.focus();
    });
    notif.show();
}

export default createNotif;