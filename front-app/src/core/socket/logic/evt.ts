import hub from "../../../hub";
hub("socket/evt");

import socket from "../socket";
import vars from "../../../var/var";
import debugFunc from "../../debug";
import uiFunc from "../../../ui/helpers/uiFunc";
import render_user from "../../../ui/render/user";
import render_dm from "../../../ui/render/dm";
import render_realm from "../../../ui/render/realm";
import { Core_socket__refresh, Core_socket__user_status_type } from "../../../types/core/socket";
import Id from "../../../types/Id";
import { Vars_realm__role, Vars_realm__user } from "../../../types/var";
import { Ui_UserState } from "../../../types/ui/render";
import LangPkg from "../../../utils/translate";

export function connect() {
    debugFunc.msg("connected to socket");
    socket.emit("realm.get");
    socket.emit("self.status.get");
    socket.emit("dm.get");
}

export function error(evt_name: string, ...data: any[]) {
    debugFunc.msg(evt_name, ...data)
    if(data.length > 0) uiFunc.uiMsg(data[0]);
}

export function error_valid(evt: string, name: string, ...data: any[]) {
    uiFunc.uiMsgT(LangPkg.socket.valid_error);
    debugFunc.msg(`Valid error: ${evt} - ${name}`, ...data)
}

export function error_spam(type: string, ...data: any[]) {
    const pkg = LangPkg.socket.spam;
    const map = {
        "last warning": pkg.last,
        "ban": pkg.ban,
        "warn": pkg.warn,
    }
    let text = map[type] || pkg.spam;

    uiFunc.uiMsgT(text, [], ...data);
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
                text = "socket.ban";
                param = timeMath[1];
            } else {
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

export function self_status_get(status: Core_socket__user_status_type, text: string) {
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

export function realm_users_sync(users: Vars_realm__user[], roles: Vars_realm__role[]) {
    vars.realm.users = users;
    vars.realm.roles = roles;
    render_realm.usersInChat();
}

interface Core_socket__realm_users_activity_sync extends Ui_UserState {
    uid: Id
}

export function realm_users_activity_sync(userActivity: Core_socket__realm_users_activity_sync[]) {
    userActivity.forEach(user => {
        const { uid, status, activity } = user;
        if (!status && !activity) return;

        render_realm.realmUserStatus(uid, user);
    })
}
