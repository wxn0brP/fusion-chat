import hub from "../../../hub.js";
hub("socket/evt");
import socket from "../socket.js";
import vars from "../../../var/var.js";
import debugFunc, { LogLevel } from "../../debug.js";
import apis from "../../../api/apis.js";
import coreFunc from "../../coreFunc.js";
import render_dm from "../../../ui/render/dm.js";
import uiFunc from "../../../ui/helpers/uiFunc.js";
import render_user from "../../../ui/render/user.js";
import render_realm from "../../../ui/render/realm.js";
import render_events from "../../../ui/render/event.js";
import LangPkg, { langFunc } from "../../../utils/translate.js";
import changeCodeToString from "../../../utils/code.js";
import apiVars from "../../../var/api.js";
import UserStateManager from "../../../ui/helpers/userStateManager.js";
export function connect() {
    debugFunc.msg(LogLevel.INFO, "connected to socket");
    socket.emit("realm.get");
    socket.emit("self.status.get");
    socket.emit("dm.get");
}
export function error(evt_name, ...data) {
    debugFunc.msg(LogLevel.ERROR, evt_name, ...data);
    if (data.length == 0)
        return;
    const first = data[0];
    if (/^[1-5][0-2]\.\d{3}$/.test(first)) {
        uiFunc.uiMsgT(LangPkg.api.error, changeCodeToString(first));
        return;
    }
    uiFunc.uiMsg(first);
}
export function error_valid(evt, name, ...data) {
    uiFunc.uiMsgT(LangPkg.socket.valid_error);
    debugFunc.msg(LogLevel.ERROR, `Valid error: ${evt} - ${name}`, ...data);
}
export function error_spam(type, ...data) {
    const pkg = LangPkg.socket.spam;
    const map = {
        "last warning": pkg.last,
        "ban": pkg.ban,
        "warn": pkg.warn,
    };
    let text = map[type] || pkg.spam;
    uiFunc.uiMsgT(text, [], ...data);
}
export function connect_error(data) {
    if (!localStorage.getItem("token"))
        window.location.href = "/login?err=true";
    debugFunc.msg(LogLevel.SOCKET_ERROR, data);
    const dataStr = data.toString();
    if (dataStr.includes("Error: Authentication error")) {
        window.location.href = "/login?err=true";
    }
    else if (dataStr.includes("Ban:")) {
        const timeMath = dataStr.match(/Ban: You are temporarily banned. Please try again after (\d+) minutes./);
        let text = "";
        let param = "";
        if (timeMath) {
            text = LangPkg.socket.ban;
            param = timeMath[1];
        }
        else {
            text = dataStr;
            param = "";
        }
        uiFunc.uiMsgT(text, param);
        return;
    }
    uiFunc.uiMsg(data.toString(), {
        extraTime: 10
    });
}
export function system_refreshToken(newToken, cb) {
    localStorage.setItem("token", newToken);
    socket.auth["token"] = newToken;
    cb(true);
}
export async function refreshData(settings, ...moreData) {
    let events = [];
    if (Array.isArray(settings)) {
        events = settings;
    }
    else if (typeof settings == "string") {
        events = [settings];
    }
    else if (typeof settings == "object") {
        const { realm, chnl, evt, wait } = settings;
        events = typeof evt == "string" ? [evt] : Array.isArray(evt) ? evt : [];
        if (realm && realm != vars.chat.to && realm !== "*")
            return;
        if (chnl && chnl != vars.chat.chnl && chnl !== "*")
            return;
        if (wait)
            await delay(wait);
    }
    else
        return;
    events.forEach(evt => {
        socket.emit(evt, ...moreData);
    });
}
export function self_status_get(status, text) {
    vars.user.status = status;
    vars.user.statusText = text;
    render_user.localUserProfile();
}
export function message_mark_read(to, chnl, id) {
    if (!to || !chnl || !id)
        return;
    try {
        apiVars.lastMess[to] = apiVars.lastMess[to] || {};
        apiVars.lastMess[to][chnl] = apiVars.lastMess[to][chnl] || { read: null, mess: null };
        apiVars.lastMess[to][chnl].read = id;
        if (to.startsWith("$"))
            render_dm.chats();
    }
    catch { }
}
export function realm_users_sync(users, roles) {
    vars.realm.users = users;
    vars.realm.roles = roles;
    render_realm.usersInChat();
}
export function realm_users_activity_sync(userActivity) {
    userActivity.forEach(user => {
        const { uid, status, activity } = user;
        if (!status && !activity)
            return;
        UserStateManager.set(uid, user);
    });
}
export function realm_event_notify(realm, evt) {
    socket.emit("realm.event.get.topic", realm, evt, (topic) => {
        const text = langFunc(LangPkg.ui.event.notif, `<b>"${topic}"</b>`, `<b>${apis.www.changeChat(realm)}</b>`);
        uiFunc.uiMsg(text, {
            onClick: () => {
                coreFunc.changeChat(realm).then(() => {
                    render_events.show();
                });
            }
        });
    });
}
export function user_status_update(id, status, text) {
    UserStateManager.set(id, { status, statusText: text });
}
//# sourceMappingURL=evt.js.map