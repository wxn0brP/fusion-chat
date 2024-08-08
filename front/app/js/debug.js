const debugFunc = {
    isDebug: localStorage.getItem("config.debug") == "true",

    init(){
        setTimeout(() => {
            if(apis.app.apiType == "rn") this.isDebug = true;
        }, 1000);

        if(!this.isDebug) return;
        setTimeout(() => {
            const script = document.createElement("script");
            script.src = "js/test.js";
            document.querySelector("#assets").appendChild(script);
        }, 5000);
    },

    msg(...data){
        if(!this.isDebug) return;
        lo(...data);
        if(apis.app.apiType == "rn") apis.api.send({ type: "debug", msg: (data.length == 1 ? data[0] : data) });
    },
}