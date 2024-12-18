SettingsServerManager.prototype.saveSettings = async function(){
    if(!this.saveCallback && typeof this.saveCallback !== "function"){
        this.container.innerHTML = "";
        return;
    }

    this.saveMetaSettings();
    const addons = JSON.parse(JSON.stringify(this.settings.addons));
    delete this.settings.addons;
    const ok = await this.saveCallback(this.settings);
    if(!ok){
        this.settings.addons = addons;
        uiFunc.uiMsg(translateFunc.get("Failed to save settings. Make sure all settings are valid."));
        return;
    }
    
    this.container.fadeOut();
    this.container.innerHTML = "";
}

SettingsServerManager.prototype.exitWithoutSaving = function(){
    if(this.exitCallback && typeof this.exitCallback === "function"){
        this.exitCallback();
    }
    this.container.fadeOut();
    this.container.innerHTML = "";
}