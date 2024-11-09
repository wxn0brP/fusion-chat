const stateManager = {
    handle(type, ...data){
        const fn = stateManagerFunc[type];
        if(!fn) return false;
        return fn(...data) || true;
    },

    async handleGetParam(){
        const params = new URLSearchParams(window.location.search);
        const ctrls = [];

        for(const [key, value] of params.entries()){
            let [prefix, num, type] = key.split("_");
            if(prefix != "ctrl") continue;
            if(!num) continue;
            if(!type) continue;

            num = parseInt(num);
            if(isNaN(num)) continue;

            ctrls.push({ type, value, num });
        }

        ctrls.sort((a, b) => a.num - b.num);

        for(const ctrl of ctrls){
            stateManager.handle(ctrl.type, ctrl.value);
            await delay(100);
        }
    },

    removeControlParams(){
        const getParam = new URLSearchParams(window.location.search);
    
        Array.from(getParam.entries()).forEach(([key]) => {
            if(key.startsWith('ctrl_')) getParam.delete(key);
        });
    
        const newParams = getParam.toString();
        const newUrl = window.location.origin + window.location.pathname + (newParams ? "?" + newParams : "");
        window.history.replaceState({}, '', newUrl);
    },

    extractUrl(){
        const path = window.location.origin + window.location.pathname;
        const params = new URLSearchParams(window.location.search);
        params.set("ctrl_1_chat", vars.chat.to);
        if(!vars.chat.to.startsWith("$")) params.set("ctrl_2_chnl", vars.chat.chnl);
        if(voiceFunc.joined) params.set("ctrl_3_voice", voiceFunc.joined);

        const url = path + "?" + params.toString();
        navigator.clipboard.writeText(url);
        uiFunc.uiMsg(translateFunc.get("Copied to clipboard") + "!");
    }
}

const stateManagerFunc = {
    chat(id){
        if(!utils.validId(id)) return;
        coreFunc.changeChat(id);
    },
    chnl(id){
        if(!utils.validId(id)) return;
        coreFunc.changeChnl(id);
    },
    voice(id){
        if(!utils.validId(id)) return;
        const conf = confirm(translateFunc.get("Are you sure you want to call $?", apis.www.changeUserID(id)));
        if(!conf) return;
        socket.emit("call.private.init", id);
    }
}