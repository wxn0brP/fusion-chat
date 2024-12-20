import hub from "../hub.js";
hub("debug");

import apis from "../api/apis.js";

const debugFunc = {
    isDebug: localStorage.getItem("config.debug") == "true",

    init(){
        setTimeout(() => {
            if(apis.app.apiType == "rn") this.isDebug = true;
        }, 1000);
    },

    msg(...data){
        if(!this.isDebug) return;
        lo(...data);
        if(apis.app.apiType == "rn") apis.api.send({ type: "debug", msg: (data.length == 1 ? data[0] : data) });
    },
}

export default debugFunc;