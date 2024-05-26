const settingDiv = document.querySelector("#settings");

const settingsFunc = {
    showUserSettings(){
        new SettingsManager(
            settingsDataUser(),
            settingDiv,
            (settings) => {
                if(settings["Status"] != undefined){
                    vars.user.status = settings["Status"];
                }
                if(settings["Status text"] != undefined){
                    vars.user.statusText = settings["Status text"];
                }
                if(settings["Status"] != undefined || settings["Status text"] != undefined){
                    socket.emit("updateStatus", vars.user.status, vars.user.statusText);
                    renderFunc.localUserProfile();
                }
            },
            () => {}
        );
    },

    showServerSettings(o_meta, o_categories, o_channels, o_roles, id){
        const ssmData = {
            meta: o_meta,
            categories: o_categories,
            channels: o_channels,
            roles: o_roles
        }

        new SettingsServerManager(
            ssmData,
            settingDiv,
            (data) => {
                const { meta, categories, channels, roles } = data;
                socket.emit("setSeverSettings", id, meta, categories, channels, roles);
            },
            () => {}
        );
    },
}

const settingsDataUser = () => [
    {
        name: "User settings",
        settings: [
            {
                name: "Status",
                type: "select",
                defaultValue: vars.user.status || "online",
                options: ["online", "away", "offline"]
            },
            {
                name: "Status text",
                type: "text",
                defaultValue: vars.user.statusText || ""
            },
            {
                name: "Logout",
                type: "button",
                onclick: () => {
                    if(!confirm("Are you sure you want to log out?")) return;
                    if(!confirm("Are you sure you want to log out? (double check)")) return;

                    localStorage.removeItem("user_id");
                    localStorage.removeItem("from");
                    localStorage.removeItem("token");
                    location.href = "/login";
                },
                css: {
                    color: "red"
                }
            }
        ]
    }
]

socket.on("getSeverSettings", (...data) => settingsFunc.showServerSettings(...data));