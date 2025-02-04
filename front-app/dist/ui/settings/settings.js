import hub from "../../hub.js";
hub("settings");
import { mglInt } from "../../var/mgl.js";
import debugFunc, { LogLevel } from "../../core/debug.js";
import settingsData from "./settingsData.js";
import SettingsManager from "./settingsLib.js";
import socket from "../../core/socket/socket.js";
import RealmSettingsManager from "./realm/realmSettings.js";
const settingDiv = document.querySelector("#settings");
const settingsFunc = {
    showUserSettings() {
        new SettingsManager(settingsData.user(), settingDiv, settingsData.userSave, () => { });
    },
    showRealmSettings(settings, id) {
        const settingsManager = new RealmSettingsManager(settings, id, settingDiv, (data) => {
            return new Promise(res => {
                socket.emit("realm.settings.set", id, data, (...errs) => {
                    if (errs.length == 1 && errs[0] === false)
                        return res(true);
                    res(false);
                    debugFunc.msg(LogLevel.ERROR, "Error saving realm settings: ", ...errs);
                });
            });
        }, () => { });
        settingsManager.init();
    },
};
socket.on("realm.settings.get", settingsFunc.showRealmSettings);
export default settingsFunc;
mglInt.settingsFunc = settingsFunc;
//# sourceMappingURL=settings.js.map