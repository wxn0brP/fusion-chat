const makeGroupDiv = document.querySelector("#makeGroup");

const buttonFunc = {
    async addPriv(){
        const to = await uiFunc.prompt("Name of the 2 people");
        if(!to) return;
        socket.emit("private.create", to);
    },

    async createGroup(){
        const name = await uiFunc.prompt("Name of the group");
        if(!name) return;
        socket.emit("group.create", name);
        setTimeout(() => {
            socket.emit("group.get");
        }, 1500);
    },

    async joinGroup(){
        let id = await uiFunc.prompt("Invite link of the group");
        if(!id) return;

        id = id
            .replace(location.protocol + "//", "")
            .replace(location.host, "")
            .replace("/serverInvite?id=", "");

        socket.emit("group.join", id);
    },

    userSettings(){
        settingsFunc.showUserSettings();
    },
}