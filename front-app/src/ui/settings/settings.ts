import { Id } from "#types/Id";
import { mglInt } from "#var/mgl";
import { Settings } from "./realm/types";
import { debugFunc, LogLevel } from "#core/debug";
import { settingsData } from "./settingsData";
import { SettingsManager } from "./settingsLib";
import { socket } from "#core/socket/socket";
import { RealmSettingsManager } from "./realm/realmSettings";
const settingDiv = document.querySelector<HTMLDivElement>("#settings");

export namespace settingsFunc {
    export async function showUserSettings() {
        new SettingsManager(
            await settingsData.user(),
            settingDiv,
            settingsData.userSave,
            () => { }
        );
    }

    export function showRealmSettings(settings: Settings, id: Id) {
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
    }
}

socket.on("realm.settings.get", settingsFunc.showRealmSettings);

mglInt.settingsFunc = settingsFunc;