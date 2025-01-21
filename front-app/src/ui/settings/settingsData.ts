import hub from "../../hub";
hub("settingsData");

import vars from "../../var/var";
import apis from "../../api/apis";
import fileFunc from "../../api/file";
import uiFunc from "../helpers/uiFunc";
import render_user from "../render/user";
import socket from "../../core/socket/socket";
import staticData from "../../var/staticData";
import { reloadProfileImages } from "../helpers/reloadImages";
import { Settings_settingsManager__category } from "../../types/ui/settings";
import LangPkg, { LangRef, load_translate } from "../../utils/translate";

interface SettingsData {
    user: () => Settings_settingsManager__category[];
    userSave: (data: any) => void
}

const settingsData: SettingsData = {
    user: () => [
        {
            name: "User settings",
            txt: LangPkg.settings_user.user_settings,
            type: "obj",
            settings: [
                {
                    name: "Status",
                    txt: LangPkg.settings_user.status,
                    type: "select",
                    defaultValue: vars.user.status || "online",
                    options: ["online", "away", "offline"]
                },
                {
                    name: "Status text",
                    txt: LangPkg.settings_user.status_text,
                    type: "text",
                    defaultValue: vars.user.statusText || ""
                },
                {
                    name: "Nickname",
                    txt: LangPkg.settings_user.nick,
                    type: "text",
                    defaultValue: apis.www.changeUserID(vars.user._id) || vars.user.fr
                },
            ]
        },
        {
            name: "Profile image",
            txt: LangPkg.settings_user.image,
            type: "fn",
            settings: () => {
                const div = document.createElement("div");
                const tmpData: { img: File | null } = {
                    img: null
                };
                div.innerHTML = `
                    <div id="_1" style="display: flex; align-items: center; column-gap: 2rem;"></div>
                `.trim();
                const container = div.querySelector('#_1');

                const imgPrev = document.createElement('img');
                imgPrev.src = "/api/profile/img?id=" + vars.user._id + "&t=" + Date.now();
                imgPrev.css("width: 128px; height: 128px; object-fit: cover;");
                container.appendChild(imgPrev);

                const imgSel = document.createElement('input');
                imgSel.type = 'file';
                imgSel.accept = staticData.uploadImgTypes.join(', ');
                imgSel.addEventListener("change", (e: Event) => {
                    const target = e.target as HTMLInputElement;
                    if (target.files && target.files[0]) {
                        const file = target.files[0];
                        tmpData.img = file;
                        imgPrev.src = URL.createObjectURL(file);
                    }
                });
                container.appendChild(imgSel);

                return [div, tmpData];
            },
            save: (div, tmpData) => {
                if (tmpData.img) {
                    fileFunc.profile(tmpData.img);
                    setTimeout(() => {
                        reloadProfileImages(vars.user._id);
                    }, 3000);
                }

                return {}
            }
        },
        {
            name: "Client settings",
            txt: LangPkg.settings_user.client_settings,
            type: "obj",
            settings: [
                {
                    name: "Language",
                    txt: LangPkg.settings_user.lang,
                    type: "select",
                    defaultValue: localStorage.getItem("lang") || "en",
                    options: LangRef.localesList
                },
                {
                    name: "Notifications",
                    txt: LangPkg.settings_user.notifications,
                    type: "checkbox",
                    defaultValue: localStorage.getItem("notifications") == "true" || false,
                    only: ["web", "ele"]
                },
                {
                    txt: LangPkg.settings_user.check_notifications_permissions,
                    type: "button",
                    onclick: () => {
                        window.Notification.requestPermission((result) => {
                            if (result == "granted") uiFunc.uiMsgT(LangPkg.uni.ok);
                            else uiFunc.uiMsgT(LangPkg.settings_user.notifications_error);
                        });
                    },
                    only: ["web", "ele"]
                },
                { type: "hr" },
                {
                    txt: LangPkg.settings_user.experimental_features,
                    type: "h2"
                },
                {
                    txt: LangPkg.settings_user.experimental_warning,
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
            txt: LangPkg.settings_user.account_settings,
            type: "obj",
            settings: [

                {
                    name: "Logout",
                    txt: LangPkg.settings_user.logout,
                    type: "button",
                    onclick: async () => {
                        const confText = LangPkg.settings_user.confirm_logout + "?";
                        if (!await uiFunc.confirm(confText)) return;
                        if (!await uiFunc.confirm(confText + " (" + LangPkg.settings_user.double_check + ")")) return;

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
                    txt: LangPkg.settings_user.delete,
                    type: "button",
                    onclick: async () => {
                        if (!await uiFunc.confirm(LangPkg.settings_user.confirm_delete.w1 + "?")) return;
                        if (!await uiFunc.confirm(LangPkg.settings_user.confirm_delete.w2 + "?")) return;
                        if (!await uiFunc.confirm(LangPkg.settings_user.confirm_delete.w3 + "?")) return;

                        socket.emit("user.delete", () => {
                            localStorage.removeItem("user_id");
                            localStorage.removeItem("from");
                            localStorage.removeItem("token");
                            alert(LangPkg.settings_user.after_delete);
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
        if (settings["Status"] != undefined) {
            vars.user.status = settings["Status"];
        }
        if (settings["Status text"] != undefined) {
            vars.user.statusText = settings["Status text"];
        }
        if (settings["Status"] != undefined || settings["Status text"] != undefined) {
            socket.emit("status.update", vars.user.status, vars.user.statusText);
            render_user.localUserProfile();
        }

        if (settings["Nickname"] != undefined) {
            socket.emit("profile.set_nickname", settings["Nickname"]);
            vars.apisTemp.user.main[vars.user._id] = settings["Nickname"];
            render_user.localUserProfile();
        }

        const lang = settings["Language"];
        if (lang != undefined) {
            if (lang != localStorage.getItem("lang")) load_translate(lang);
        }

        const notifications = settings["Notifications"];
        if (notifications != undefined) {
            localStorage.setItem("notifications", notifications);
            vars.settings.notifications = notifications;
            if (notifications) {
                // check permissions
                window.Notification.requestPermission((result) => {
                    if (result == "granted") return;
                    uiFunc.uiMsgT(LangPkg.settings_user.notifications_error);
                });
            }
        }

        const desktopHandling = settings["desktopHandling"];
        if (desktopHandling != undefined) {
            localStorage.setItem("desktopHandling", desktopHandling);
            vars.settings.desktopHandling = desktopHandling;
            if (!desktopHandling) socket.emit("status.activity.remove");
            if (apis.app.apiType == "ele") apis.api.send({ type: "desktopHandling", data: desktopHandling });
        }
    },
}

export default settingsData;