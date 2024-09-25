const apis = {
    www: {
        changeUserID(id){
            const chat = vars.chat.to;
            const temp = vars.apisTemp.user;
            if(chat.startsWith("$") || chat == "main"){
                if(temp.main[id]) return temp.main[id];
                const data = apis.www.getInServer("/api/userId?user="+id).name;
                temp.main[id] = data;
                return data;
            }
            if(!temp[chat]) temp[chat] = {};

            const issetData = temp[chat][id];
            if(issetData) return issetData;
            if(issetData == 0) return temp.main[id];

            const data = apis.www.getInServer("/api/userId?user="+id+"&chat="+chat);
            if(data.isServer){
                temp[chat][id] = data.name;
            }else{
                temp.main[id] = data.name;
                temp[chat][id] = 0;
            }
            
            return data.name;
        },

        changeChat(id){
            if(vars.apisTemp.chat[id]) return vars.apisTemp.chat[id];
            const data = apis.www.getInServer("/api/chatId?chat="+id).name;
            vars.apisTemp.chat[id] = data;
            return data;
        },

        getInServer(url){
            const dataS = cw.get(url);
            const data = JSON.parse(dataS);
            if(data.err){
                uiFunc.uiMsg(translateFunc.get("Error fetching data from the server") + ".");
                debugFunc.msg(data);
                return null;
            }
            return data;
        }
    },
    app: {
        init(){
            return new Promise((resolve) => {
                const dev = {
                    isElectron: navigator.userAgent.toLowerCase().includes('electron'),
                    isInIframe: window.self !== window.top,
                    isReactNative: !!window.ReactNativeWebView,
                    // isMobile: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
                };
                
                const script = document.createElement("script");
                let path = "web";
                if(dev.isElectron) path = "ele";
                else if(dev.isReactNative) path = "rn";
                else if(dev.isInIframe) path = "if";
                this.apiType = path;
            
                script.src = "js/devices/"+path+".js";
                const loadEvt = () => {
                    debugFunc.msg("load api: "+path);
                    script.removeEventListener("load", loadEvt);
                    resolve();
                }
                script.addEventListener("load", loadEvt);
                document.querySelector("#assets").appendChild(script);
            })

        },
        apiType: "",
    },
    api: {}
}