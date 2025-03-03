import hub from "../../../hub";
hub("rs/save");

import rs_dataF from "./rs_var";
import uiFunc from "../../helpers/uiFunc";
import LangPkg from "../../../utils/translate";

export const saveSettings = async function () {
    const rs_data = rs_dataF();
    const _this = rs_data._this;
    const settings = rs_data.settings;

    if (!_this.saveCallback && typeof _this.saveCallback !== "function") {
        rs_data.container.innerHTML = "";
        return;
    }

    _this.saveMetaSettings();
    const addons = JSON.parse(JSON.stringify(settings.addons));
    // @ts-ignore: delete addons property before sending to server
    delete settings.addons;
    const saved = await _this.saveCallback(settings);
    settings.addons = addons;
    if (!saved) {
        uiFunc.uiMsgT(LangPkg.settings_realm.failed_to_save);
        return;
    }
    return true;
}

export const exitWithoutSaving = function () {
    const rs_data = rs_dataF();
    const _this = rs_data._this;
    if (_this.exitCallback && typeof _this.exitCallback === "function") {
        _this.exitCallback();
    }
    rs_data.container.fadeOut();
    rs_data.container.innerHTML = "";
}

export const saveAndExitSettings = async function () {
    const saved = await saveSettings();
    if (!saved) return;
    exitWithoutSaving();
}