import debugFunc, { LogLevel } from "#debug";
import socket from "#socket";
import { syncManager } from "#socket/sync";
import { $store } from "#store";
import { Core_socket__refresh } from "#types/core/socket";
import uiFunc from "#uiFunc";
import changeCodeToString from "#utils/code";
import LangPkg from "#utils/translate";
import utils from "#utils/utils";

export function connect() {
    debugFunc.msg(LogLevel.INFO, "connected to socket");
    syncManager.sync();
}

export function error(evt_name: string, ...data: any[]) {
    debugFunc.msg(LogLevel.ERROR, evt_name, ...data);
    if (data.length == 0) return;

    const first = data[0];
    if (/^[1-5][0-2]\.\d{3}$/.test(first)) {
        uiFunc.uiMsgT(LangPkg.api.error, changeCodeToString(first));
        return;
    }

    uiFunc.uiMsg(first);
}

export function error_valid(evt: string, name: string, ...data: any[]) {
    uiFunc.uiMsgT(LangPkg.socket.valid_error);
    debugFunc.msg(LogLevel.ERROR, `Valid error: ${evt} - ${name}`, ...data)
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

    debugFunc.msg(LogLevel.SOCKET_ERROR, data);
    const dataStr = data.toString();
    if (dataStr.includes("Error: Authentication error")) {
        window.location.href = "/login?err=true";
    } else
        if (dataStr.includes("Ban:")) {
            const timeMath = dataStr.match(/Ban: You are temporarily banned. Please try again after (\d+) minutes./);
            let text = "";
            let param = "";
            if (timeMath) {
                text = LangPkg.socket.ban;
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
    } else if (typeof settings == "string") {
        events = [settings];
    } else if (typeof settings == "object") {
        const { realm, chnl, evt, wait } = settings as Core_socket__refresh;
        events = typeof evt == "string" ? [evt] : Array.isArray(evt) ? evt : [];

        if (realm && realm != $store.chat.id.get() && realm !== "*") return;
        if (chnl && chnl != $store.chat.chnl.get() && chnl !== "*") return;
        if (wait) await utils.delay(wait);
    }
    else return;

    events.forEach(evt => {
        socket.emit(evt, ...moreData);
    });
}