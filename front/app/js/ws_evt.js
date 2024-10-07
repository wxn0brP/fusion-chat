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

socket.on("message.markAsRead", (toR, chnl, id) => {
    if(!toR || !chnl || !id) return;
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