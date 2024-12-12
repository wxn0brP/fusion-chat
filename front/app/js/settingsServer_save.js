SettingsServerManager.prototype.saveSettings = function(){
    this.container.fadeOut();
    if(!this.saveCallback && typeof this.saveCallback !== "function"){
        this.container.innerHTML = "";
        return;
    }
    
    this.saveMetaSettings();
    delete this.settings.addons;
    this.saveCallback(this.settings);
    
    this.container.innerHTML = "";
}

SettingsServerManager.prototype.exitWithoutSaving = function(){
    if(this.exitCallback && typeof this.exitCallback === "function"){
        this.exitCallback();
    }
    this.container.fadeOut();
    this.container.innerHTML = "";
}