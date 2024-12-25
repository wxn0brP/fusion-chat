import hub from "../../../hub.js";
hub("socket/evt");

import socket from "../socket.js";
import vars from "../../../var/var.js";
import renderFunc from "../../../ui/components/renders.js";
import debugFunc from "../../debug.js";
import uiFunc from "../../../ui/helpers/uiFunc.js";
import translateFunc from "../../../utils/translate.js";

export function connect(){
    debugFunc.msg("connected to socket");
    socket.emit("realm.get");
    socket.emit("self.status.get");
    socket.emit("dm.get");
}

export function error(text, ...data){
    uiFunc.uiMsg(translateFunc.get(text, ...data));
    debugFunc.msg(...data)
}

export function error_valid(evt, name, ...data){
    uiFunc.uiMsg(translateFunc.get("Error processing data. Some features may not work correctly."));
    debugFunc.msg(`Valid error: ${evt} - ${name}`, ...data)
}

export function error_spam(type, ...data){
    let text = "Detected spam.";
    switch(type){
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

export function connect_error(data){
    if(!localStorage.getItem("token")) window.location = "/login?err=true";

    debugFunc.msg(data);
    const dataStr = data.toString();
    if(dataStr.includes("Error: Authentication error")){
        window.location = "/login?err=true";
    }else
    if(dataStr.includes("Ban:")){
        const timeMath = dataStr.match(/Ban: You are temporarily banned. Please try again after (\d+) minutes./);
        let text = "";
        let param = "";
        if(timeMath){
            text = "You are temporarily banned. Please try again after $ minutes.";
            param = timeMath[1];
        }else{
            text = dataStr;
            param = "";
        }

        uiFunc.uiMsg(translateFunc.get(text, param));
        return;
    }

    uiFunc.uiMsg(data.toString(), 10);
}

export function system_refreshToken(newToken, cb){
    localStorage.setItem("token", newToken);
    socket.auth.token = newToken;
    cb(true);
}

export async function refreshData(settings, ...moreData){
    let events = [];

    if(Array.isArray(settings)){
        events = settings;
    }else
    if(typeof settings == "string"){
        events = [settings];
    }else
    if(typeof settings == "object"){
        const { server, chnl, evt, wait } = settings;
        events = typeof evt == "string" ? [evt] : Array.isArray(evt) ? evt : [];

        if(server && server != vars.chat.to && server !== "*") return;
        if(chnl && chnl != vars.chat.chnl && chnl !== "*") return;
        if(wait) await delay(wait);
    }
    else return;

    events.forEach(evt => {
        socket.emit(evt, ...moreData);
    });
}

export function self_status_get(status, text){
    vars.user.status = status;
    vars.user.statusText = text;
    renderFunc.localUserProfile();
}

export function message_markAsRead(to, chnl, id){
    if(!to || !chnl || !id) return;
    try{
        // generate last message storage if needed
        vars.lastMess[to] = vars.lastMess[to] || {};
        vars.lastMess[to][chnl] = vars.lastMess[to][chnl] || { read: null, mess: null };

        vars.lastMess[to][chnl].read = id;
        if(to.startsWith("$")) renderFunc.privs();
    }catch{}
}

export function realm_users_sync(users, roles){
    vars.realm.users = users;
    vars.realm.roles = roles;
    renderFunc.usersInChat();
    users.forEach(user => {
        renderFunc.serverUserStatus(user.uid, { activity: Object.assign({}, user.activity) });
        delete user.activity;
    })
}
