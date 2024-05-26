const apis = {
    www: {
        changeUserID(id){
            if(vars.apisTemp.user[id]) return vars.apisTemp.user[id];
            const data = apis.www.getInServer("/userId?user="+id);
            vars.apisTemp.user[id] = data;
            return data;
        },

        changeChat(id){
            if(vars.apisTemp.chat[id]) return vars.apisTemp.chat[id];
            const data = apis.www.getInServer("/chatId?chat="+id);
            vars.apisTemp.chat[id] = data;
            return data;
        },

        getInServer(url){
            const dataS = cw.get(url);
            const data = JSON.parse(dataS);
            if(data.err){
                alert("Error getInServer: url: "+url+"  ::  "+dataS);
                return null;
            }
            return data.msg;
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