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

    showServerSettings(dataI, id){
        new SettingsServerManager(
            dataI,
            id,
            settingDiv,
            (data) => {
                socket.emit("server.settings.set", id, data);
            },
            () => {}
        );
    },
}

socket.on("server.settings.get", settingsFunc.showServerSettings);