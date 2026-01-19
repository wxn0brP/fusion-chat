import { Id } from "#types/Id";
import { mglInt } from "#var/mgl";
import { Settings } from "./realm/types";
import { core_debug, LogLevel } from "#core/debug";
import { settingsData } from "./settingsData";
import { SettingsManager } from "./settingsLib";
import { socket } from "#core/socket/socket";
import { RealmSettingsManager } from "./realm/realmSettings";
const settingDiv = document.querySelector<HTMLDivElement>("#settings");

export namespace settings_func {
    export async function showUserSettings() {
        new SettingsManager(
            await settingsData.user(),
            settingDiv,
            settingsData.userSave,
            () => { }
        );
    }

    export function sck_showRealmSettings(settings: Settings, id: Id) {
        const settingsManager = new RealmSettingsManager(
            settings,
            id,
            settingDiv,
            (data: Settings) => {
                return new Promise(res => {
                    socket.emit("realm.settings.set", id, data, (...errs) => {
                        if (errs.length == 1 && errs[0] === false) return res(true);
                        res(false);
                        core_debug.msg(LogLevel.ERROR, "Error saving realm settings: ", ...errs);
                    });
                })
            },
            () => { }
        );
        settingsManager.init();
    }
}

socket.on("realm.settings.get", settings_func.sck_showRealmSettings);

mglInt.settingsFunc = settings_func;