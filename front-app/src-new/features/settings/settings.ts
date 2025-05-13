import { Settings } from "./realm/types";
import debugFunc, { LogLevel } from "#core/debug";
import settingsData from "./settingsData";
import SettingsManager from "./settingsLib";
import socket from "#socket";
import RealmSettingsManager from "./realm/realmSettings";
import { Id } from "#types/base";
import globalExpose from "#bus";
const settingDiv = document.querySelector<HTMLDivElement>("#settings");

const settingsFunc = {
    showUserSettings() {
        new SettingsManager(
            settingsData.user(),
            settingDiv,
            settingsData.userSave,
            () => { }
        );
    },

    showRealmSettings(settings: Settings, id: Id) {
        const settingsManager = new RealmSettingsManager(
            settings,
            id,
            settingDiv,
            (data: Settings) => {
                return new Promise(res => {
                    socket.emit("realm.settings.set", id, data, (...errs) => {
                        if (errs.length == 1 && errs[0] === false) return res(true);
                        res(false);
                        debugFunc.msg(LogLevel.ERROR, "Error saving realm settings: ", ...errs);
                    });
                })
            },
            () => { }
        );
        settingsManager.init();
    },
}

socket.on("realm.settings.get", settingsFunc.showRealmSettings);
export default settingsFunc;
globalExpose("settings", "showUserSettings", settingsFunc.showUserSettings);