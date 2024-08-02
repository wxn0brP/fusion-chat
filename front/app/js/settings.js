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

    showServerSettings(dataI, id){
        new SettingsServerManager(
            dataI,
            settingDiv,
            (data) => {
                socket.emit("setSeverSettings", id, data);
            },
            () => {}
        );
    },
}

const settingsDataUser = () => [
    {
        name: "User settings",
        txt: translateFunc.get("User settings"),
        type: "obj",
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
    },
    {
        name: "Profile",
        txt: translateFunc.get("Profile"),
        type: "fn",
        settings: () => {
            const div = document.createElement("div");
            div.tmpData = {};
            div.innerHTML = `
                <div id="_1" style="display: flex; align-items: center; column-gap: 2rem;"></div>
            `.trim();
            const conteiner = div.querySelector('#_1');

            const imgPrev = document.createElement('img');
            imgPrev.src = "/profileImg?id=" + vars.user._id + "&t=" + Date.now();
            imgPrev.style = "width: 128px; height: 128px; object-fit: cover;";
            conteiner.appendChild(imgPrev);

            const imgSel = document.createElement('input');
            imgSel.type = 'file';
            imgSel.accept = ['image/png', 'image/jpeg', "image/jpg", 'image/gif', 'image/webp'].join(', ');
            imgSel.addEventListener("change", e => {
                div.tmpData.img = e.target.files[0];
                imgPrev.src = URL.createObjectURL(e.target.files[0]);
            });
            conteiner.appendChild(imgSel);

            return div;
        },
        save: (div) => {
            if(div.tmpData.img){
                fileFunc.profile(div.tmpData.img);
            }
            
            return {}
        }
    }
]

socket.on("getSeverSettings", (...data) => settingsFunc.showServerSettings(...data));