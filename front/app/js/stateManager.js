const stateManager = {
    handle(type, ...data){
        const fn = stateManagerFunc[type];
        if(!fn) return false;
        return fn(...data) || true;
    },

    async handleArray(arr){
        for(const data of arr){
            const val = Array.isArray(data.value) ? data.value : [data.value];
            await stateManager.handle(data.type, ...val);
            await delay(100);
        }
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
        await stateManager.handleArray(ctrls);
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
        if(vars.chat.to.startsWith("$")){
            params.set("ctrl_1_chat", vars.chat.to);
        }else{
            params.set("ctrl_1_cc", vars.chat.to + "_" + vars.chat.chnl);
        }

        const url = path + "?" + params.toString();
        setTimeout(() => {
            navigator.clipboard.writeText(url).then(() => {
                uiFunc.uiMsg(translateFunc.get("Copied to clipboard") + "!");
            }).catch(() => {
                uiFunc.uiMsg(translateFunc.get("Failed to copy to clipboard") + ".");
            });
        }, 2000)
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

    cc(ids){
        const [chat, chnl] = ids.split("_");
        if(!utils.validId(chat)) return;
        if(!utils.validId(chnl)) return;
        coreFunc.changeChat(chat, chnl);
    },

    call(id){
        if(!utils.validId(id)) return;
        const conf = confirm(translateFunc.get("Are you sure you want to call $?", apis.www.changeUserID(id)));
        if(!conf) return;
        socket.emit("call.private.init", id);
    }
}