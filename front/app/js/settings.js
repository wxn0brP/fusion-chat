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
                if(settings["Language"] != undefined){
                    if(settings["Language"] != localStorage.getItem("lang")) translateFunc.load(settings["Language"]);
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
        txt: translateFunc.get("User settings"),
        settings: [
            {
                name: "Status",
                txt: translateFunc.get("Status"),
                type: "select",
                defaultValue: vars.user.status || "online",
                options: ["online", "away", "offline"]
            },
            {
                name: "Status text",
                txt: translateFunc.get("Status text"),
                type: "text",
                defaultValue: vars.user.statusText || ""
            },
            {
                name: "Logout",
                txt: translateFunc.get("Logout"),
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
            },
            {
                "name": "Language",
                "txt": translateFunc.get("Language"),
                "type": "select",
                "defaultValue": localStorage.getItem("lang") || "en",
                "options": translateFunc.localesList
            }
        ]
    }
]

socket.on("getSeverSettings", (...data) => settingsFunc.showServerSettings(...data));