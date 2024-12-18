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