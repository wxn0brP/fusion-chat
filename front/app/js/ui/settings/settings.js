import hub from "../../hub.js";
hub("settings");

const settingDiv = document.querySelector("#settings");
import socket from "../../core/socket/ws.js";
import settingsData from "./settingsData.js";
import debugFunc from "../../core/debug.js";
import SettingsManager from "./settingsLib.js";
import SettingsServerManager from "./settingsServerLib.js";

const settingsFunc = {
    showUserSettings(){
        new SettingsManager(
            settingsData.user(),
            settingDiv,
            settingsData.userSave,
            () => {}
        );
    },

    showRealmSettings(dataI, id){
        new SettingsServerManager(
            dataI,
            id,
            settingDiv,
            (data) => {
                return new Promise(res => {
                    socket.emit("realm.settings.set", id, data, (...errs) => {
                        if(errs.length == 1 && errs[0] === false) return res(true);
                        res(false);
                        debugFunc.msg(...errs);
                    });
                })
            },
            () => {}
        );
    },
}

socket.on("realm.settings.get", settingsFunc.showRealmSettings);
export default settingsFunc;