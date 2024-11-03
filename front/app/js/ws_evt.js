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

socket.on("status.get", (status, text) => {
    vars.user.status = status;
    vars.user.statusText = text;
    renderFunc.localUserProfile();
});

socket.on("message.markAsRead", (to, chnl, id) => {
    if(!to || !chnl || !id) return;
    try{
        // generate last message storage if needed
        vars.lastMess[to] = vars.lastMess[to] || {};
        vars.lastMess[to][chnl] = vars.lastMess[to][chnl] || { read: null, mess: null };

        vars.lastMess[to][chnl].read = id;
        if(to.startsWith("$")) renderFunc.privs();
    }catch{}
});

socket.on("server.roles.sync", (users, roles) => {
    vars.servers.users = users;
    vars.servers.roles = roles;
});