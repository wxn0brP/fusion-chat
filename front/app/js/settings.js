const settingDiv = document.querySelector("#settings");

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
                socket.emit("realm.settings.set", id, data);
            },
            () => {}
        );
    },
}

socket.on("realm.settings.get", settingsFunc.showRealmSettings);