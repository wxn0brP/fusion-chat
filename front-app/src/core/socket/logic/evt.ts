import hub from "../../../hub";
hub("socket/evt");

import socket from "../socket";
import vars from "../../../var/var";
import debugFunc from "../../debug";
import uiFunc from "../../../ui/helpers/uiFunc";
import translateFunc from "../../../utils/translate";
import render_user from "../../../ui/render/user";
import render_dm from "../../../ui/render/dm";
import render_realm from "../../../ui/render/realm";
import { Core_socket__refresh, Core_socket__user_startus_type } from "../../../types/core/socket";
import Id from "../../../types/Id";

export function connect() {
    debugFunc.msg("connected to socket");
    socket.emit("realm.get");
    socket.emit("self.status.get");
    socket.emit("dm.get");
}

export function error(text: string, ...data: any[]) {
    uiFunc.uiMsg(translateFunc.get(text, ...data));
    debugFunc.msg(...data)
}

export function error_valid(evt: string, name: string, ...data: any[]) {
    uiFunc.uiMsg(translateFunc.get("Error processing data. Some features may not work correctly."));
    debugFunc.msg(`Valid error: ${evt} - ${name}`, ...data)
}

export function error_spam(type: string, ...data: any[]) {
    let text = "Detected spam.";
    switch (type) {
        case "last warning":
            text = "Detected spam. Please wait $ seconds and try again. Your behavior has been logged.";
            break;
        case "ban":
            text = "Spam detected from your account. You have been temporarily banned due to spam activity.";
            break;
        case "warn":
            text = "Spam protection activated. Please wait a moment and try again.";
            break;
    }

    uiFunc.uiMsg(translateFunc.get(text, ...data));
}

export function connect_error(data: Error) {
    if (!localStorage.getItem("token")) window.location.href = "/login?err=true";

    debugFunc.msg(data);
    const dataStr = data.toString();
    if (dataStr.includes("Error: Authentication error")) {
        window.location.href = "/login?err=true";
    } else
        if (dataStr.includes("Ban:")) {
            const timeMath = dataStr.match(/Ban: You are temporarily banned. Please try again after (\d+) minutes./);
            let text = "";
            let param = "";
            if (timeMath) {
                text = "You are temporarily banned. Please try again after $ minutes.";
                param = timeMath[1];
            } else {
                text = dataStr;
                param = "";
            }

            uiFunc.uiMsg(translateFunc.get(text, param));
            return;
        }

    uiFunc.uiMsg(data.toString(), 10);
}

export function system_refreshToken(newToken: string, cb: (value: boolean) => void) {
    localStorage.setItem("token", newToken);
    socket.auth["token"] = newToken;
    cb(true);
}

export async function refreshData(settings: string | string[] | Core_socket__refresh, ...moreData: any[]) {
    let events = [];

    if (Array.isArray(settings)) {
        events = settings;
    } else
        if (typeof settings == "string") {
            events = [settings];
        } else
            if (typeof settings == "object") {
                const { realm, chnl, evt, wait } = settings as Core_socket__refresh;
                events = typeof evt == "string" ? [evt] : Array.isArray(evt) ? evt : [];

                if (realm && realm != vars.chat.to && realm !== "*") return;
                if (chnl && chnl != vars.chat.chnl && chnl !== "*") return;
                if (wait) await delay(wait);
            }
            else return;

    events.forEach(evt => {
        socket.emit(evt, ...moreData);
    });
}

export function self_status_get(status: Core_socket__user_startus_type, text: string) {
    vars.user.status = status;
    vars.user.statusText = text;
    render_user.localUserProfile();
}

export function message_markAsRead(to: Id, chnl: Id, id: Id) {
    if (!to || !chnl || !id) return;
    try {
        // generate last message storage if needed
        vars.lastMess[to] = vars.lastMess[to] || {};
        vars.lastMess[to][chnl] = vars.lastMess[to][chnl] || { read: null, mess: null };

        vars.lastMess[to][chnl].read = id;
        if (to.startsWith("$")) render_dm.chats();
    } catch { }
}

export function realm_users_sync(users, roles) {
    vars.realm.users = users;
    vars.realm.roles = roles;
    render_realm.usersInChat();
    users.forEach(user => {
        render_realm.realmUserStatus(user.uid, { activity: Object.assign({}, user.activity) });
        delete user.activity;
    })
}
