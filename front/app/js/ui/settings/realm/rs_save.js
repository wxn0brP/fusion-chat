import hub from "../../../hub.js";
hub("rs_save");

export const saveSettings = async function(_this){
    if(!_this.saveCallback && typeof _this.saveCallback !== "function"){
        _this.container.innerHTML = "";
        return;
    }

    _this.saveMetaSettings();
    const addons = JSON.parse(JSON.stringify(_this.settings.addons));
    delete _this.settings.addons;
    const ok = await _this.saveCallback(_this.settings);
    if(!ok){
        _this.settings.addons = addons;
        uiFunc.uiMsg(translateFunc.get("Failed to save settings. Make sure all settings are valid."));
        return;
    }
    
    _this.container.fadeOut();
    _this.container.innerHTML = "";
}

export const exitWithoutSaving = function(_this){
    if(_this.exitCallback && typeof _this.exitCallback === "function"){
        _this.exitCallback();
    }
    _this.container.fadeOut();
    _this.container.innerHTML = "";
}