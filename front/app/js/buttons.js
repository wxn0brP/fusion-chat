const makeRealmDiv = document.querySelector("#makeRealm");

const buttonFunc = {
    async addPriv(){
        const to = await uiFunc.prompt("Name of the 2 people");
        if(!to) return;
        socket.emit("dm.create", to);
    },

    async createrealm(){
        const name = await uiFunc.prompt("Name of the realm");
        if(!name) return;
        socket.emit("realm.create", name);
        setTimeout(() => {
            socket.emit("realm.get");
        }, 1500);
    },

    async joinrealm(){
        let id = await uiFunc.prompt("Invite link of the realm");
        if(!id) return;

        id = id
            .replace(location.protocol + "//", "")
            .replace(location.host, "")
            .replace("/serverInvite?id=", "");

        socket.emit("realm.join", id);
    },

    userSettings(){
        settingsFunc.showUserSettings();
    },
}