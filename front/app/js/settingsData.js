const settingsData = {
    user: () => [
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
                    name: "Nickname",
                    txt: translateFunc.get("Nickname"),
                    type: "text",
                    defaultValue: apis.www.changeUserID(vars.user._id) || vars.user.fr
                },
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
                imgPrev.src = "/api/profile/img?id=" + vars.user._id + "&t=" + Date.now();
                imgPrev.style = "width: 128px; height: 128px; object-fit: cover;";
                conteiner.appendChild(imgPrev);

                const imgSel = document.createElement('input');
                imgSel.type = 'file';
                imgSel.accept = vars.uploadImgTypes.join(', ');
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
        },
        {
            name: "Client settings",
            txt: translateFunc.get("Client settings"),
            type: "obj",
            settings: [
                {
                    name: "Language",
                    txt: translateFunc.get("Language"),
                    type: "select",
                    defaultValue: localStorage.getItem("lang") || "en",
                    options: translateFunc.localesList
                },
                {
                    name: "Notifications",
                    txt: translateFunc.get("Notifications"),
                    type: "checkbox",
                    defaultValue: localStorage.getItem("notifications") == "true" || false,
                },
                {
                    name: "Notifications permissions",
                    txt: translateFunc.get("Check notifications permissions"),
                    type: "button",
                    onclick: () => {
                        window.Notification.requestPermission((result) => {
                            if(result == "granted") uiFunc.uiMsg(translateFunc.get("OK"));
                            else uiFunc.uiMsg(translateFunc.get("Notification permission denied") + ".");
                        });
                    }
                },
                {
                    name: "desktopHandling",
                    txt: translateFunc.get("Desktop app handling fullscreen and set activity (alpha feature, not recommended for always on)"),
                    type: "checkbox",
                    defaultValue: localStorage.getItem("desktopHandling") == "true" || false
                }
            ]
        },
        {
            name: "Account settings",
            txt: translateFunc.get("Account settings"),
            type: "obj",
            settings: [
                
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
                        socket.emit("logout", () => {
                            location.href = "/login";
                        });
                    },
                    css: {
                        color: "red"
                    }
                },
                {
                    name: "Delete Account",
                    txt: translateFunc.get("Delete Account"),
                    type: "button",
                    onclick: () => {
                        if(!confirm(translateFunc.get("Are you sure you want to delete your account?"))) return;
                        if(!confirm(translateFunc.get("Are you absolutely sure? This action is irreversible."))) return;
                        
                        socket.emit("user.delete", () => {
                            localStorage.removeItem("user_id");
                            localStorage.removeItem("from");
                            localStorage.removeItem("token");
                            alert(translateFunc.get("Check your email to confirm the deletion"));
                            location.href = "/login";
                        });
                    },
                    css: {
                        color: "red"
                    }
                }
            ]
        }
    ],

    userSave: (settings) => {
        if(settings["Status"] != undefined){
            vars.user.status = settings["Status"];
        }
        if(settings["Status text"] != undefined){
            vars.user.statusText = settings["Status text"];
        }
        if(settings["Status"] != undefined || settings["Status text"] != undefined){
            socket.emit("status.update", vars.user.status, vars.user.statusText);
            renderFunc.localUserProfile();
        }

        if(settings["Nickname"] != undefined){
            socket.emit("profile.set_nickname", settings["Nickname"]);
            vars.apisTemp.user.main[vars.user._id] = settings["Nickname"];
            renderFunc.localUserProfile();
        }

        const lang = settings["Language"];
        if(lang != undefined){
            if(lang != localStorage.getItem("lang")) translateFunc.load(lang);
        }

        const notifications = settings["Notifications"];
        if(notifications != undefined){
            localStorage.setItem("notifications", notifications);
            vars.settings.notifications = notifications;
            if(notifications){
                // check permissions
                window.Notification.requestPermission((result) => {
                    if(result == "granted") return;
                    uiFunc.uiMsg(translateFunc.get("Notification permission denied") + ".");
                });
            }
        }

        const desktopHandling = settings["desktopHandling"];
        if(desktopHandling != undefined){
            localStorage.setItem("desktopHandling", desktopHandling);
            vars.settings.desktopHandling = desktopHandling;
            if(!desktopHandling) socket.emit("status.activity.remove");
            if(apis.app.apiType == "ele") apis.api.send({type: "desktopHandling", data: desktopHandling});
        }
    },
}