const socket = io("/", {
    transports: ["websocket"],
    auth: {
        token: localStorage.getItem("token")
    },
    autoConnect: false,
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    reconnectionAttempts: Infinity,
    maxReconnectionAttempts: Infinity
});

socket.on("connect", () => {
    debugFunc.msg("connected to socket");
    socket.emit("group.get");
    socket.emit("status.get");
    socket.emit("private.get");
});

socket.on("error", (text, ...data) => {
    uiFunc.uiMsg(translateFunc.get(text, ...data));
    debugFunc.msg(...data)
});

socket.on("error.valid", (evt, name, ...data) => {
    uiFunc.uiMsg(translateFunc.get("Error processing data. Some features may not work correctly."));
    debugFunc.msg(`Valid error: ${evt} - ${name}`, ...data)
});

socket.on("error.spam", (type, ...data) => {
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
});

socket.on("connect_error", (data) => {
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
});

socket.on("status.get", (status, text) => {
    vars.user.status = status;
    vars.user.statusText = text;
    renderFunc.localUserProfile();
});

socket.on("message.markAsRead", (toR, chnl, id) => {
    try{
        const to = toR.replace("$", "");
        const friendChat = toR.startsWith("$");
        if(!vars.lastMess[to]){
            vars.lastMess[to] = {};
            if(friendChat) renderFunc.privs();
        }
        if(!vars.lastMess[to][chnl]){
            vars.lastMess[to][chnl] = {
                read: null,
                mess: null
            }
            if(friendChat) renderFunc.privs();
        }

        vars.lastMess[to.replace("$", "")][chnl].read = id;
        if(friendChat) renderFunc.privsRead();
    }catch{}
});

socket.on("server.roles.sync", (users, roles) => {
    vars.servers.users = users;
    vars.servers.roles = roles;
});

socket.on("refreshData", (settings, ...moreData) => {
    let events = [];

    if(Array.isArray(settings)){
        events = settings;
    }else
    if(typeof settings == "string"){
        events = [settings];
    }else
    if(typeof settings == "object"){
        const { server, chnl, evt } = settings;
        events = typeof evt == "string" ? [evt] : Array.isArray(evt) ? evt : [];

        if(server && server != vars.chat.to && server !== "*") return;
        if(chnl && chnl != vars.chat.chnl && chnl !== "*") return;
    }else return;

    events.forEach(evt => {
        socket.emit(evt, ...moreData);
    });
});
