socket.on("refreshData", async (settings, ...moreData) => {
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
});

socket.on("self.status.get", (status, text) => {
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

socket.on("realm.users.sync", (users, roles) => {
    vars.realm.users = users;
    vars.realm.roles = roles;
    renderFunc.usersInChat();
    users.forEach(user => {
        renderFunc.serverUserStatus(user.uid, { activity: Object.assign({}, user.activity) });
        delete user.activity;
    })
});