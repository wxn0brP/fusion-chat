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
    socket.emit("getGroups");
    socket.emit("getStatus");
    socket.emit("getPrivs");
});

socket.on("error", (text, ...data) => {
    uiFunc.uiMsg(translateFunc.get(text, ...data));
    debugFunc.msg(...data)
});

socket.on("connect_error", (data) => {
    if(!localStorage.getItem("token")) window.location = "/login?err=true";

    debugFunc.msg(data);
    if(data.toString() == "Error: Authentication error"){
        window.location = "/login?err=true";
    }
    uiFunc.uiMsg(data.toString(), 10);
});

socket.on("getStatus", (status, text) => {
    vars.user.status = status;
    vars.user.statusText = text;
    renderFunc.localUserProfile();
});

socket.on("markAsRead", (toR, chnl, id) => {
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

socket.on("syncUserRoles", (users, roles) => {
    vars.servers.users = users;
    vars.servers.roles = roles;
});

socket.on("userProfile", (data) => {
    renderFunc.userProfile(data);
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
