import hub from "../../hub.js";
hub("settingsData");

import translateFunc from "../../utils/translate.js";
import vars from "../../var/var.js";
import apis from "../../api/apis.js";
import socket from "../../core/socket/ws.js";
import renderFunc from "../components/renders.js";

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
            name: "Profile image",
            txt: translateFunc.get("Profile image"),
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
                    only: ["web", "ele"]
                },
                {
                    txt: translateFunc.get("Check notifications permissions"),
                    type: "button",
                    onclick: () => {
                        window.Notification.requestPermission((result) => {
                            if(result == "granted") uiFunc.uiMsg(translateFunc.get("OK"));
                            else uiFunc.uiMsg(translateFunc.get("Notification permission denied") + ".");
                        });
                    },
                    only: ["web", "ele"]
                },
                { type: "hr" },
                {
                    txt: translateFunc.get("Experimental features"),
                    type: "h2"
                },
                {
                    txt: translateFunc.get("Not all features are stable and may not work as expected. Use at your own risk."),
                    type: "h3"
                },
                {
                    name: "desktopHandling",
                    txt: "Desktop app handling fullscreen and set activity",
                    type: "checkbox",
                    only: "ele",
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
                        const confText = translateFunc.get("Are you sure you want to log out") + "?";
                        const doubleText = " (" + translateFunc.get("double check") + ")";
                        if(!confirm(confText)) return;
                        if(!confirm(confText+doubleText)) return;

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
                        const confText = translateFunc.get("Are you sure you want to delete your account") + "?";
                        const doubleText = " (" + translateFunc.get("double check") + ")";
                        const tripleText = " (" + translateFunc.get("triple check") + ")";
                        if(!confirm(confText)) return;
                        if(!confirm(confText+doubleText)) return;
                        if(!confirm(confText+tripleText)) return;
                        
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

export default settingsData;