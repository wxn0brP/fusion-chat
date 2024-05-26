(function(){
    function exit(){
        location.href = "/login?err=true&next=/qrCodeLogin?k="+s_id;
    }

    const paramsURL = new URLSearchParams(location.search);
    const s_id = paramsURL.get("k");
    if(!s_id){
        exit();
        return;
    }

    if(!localStorage.getItem("token") || !localStorage.getItem("user_id") || !localStorage.getItem("from")){
        exit();
        return;
    }

    const socket = io("/qrCodeLogin", {
        auth: {
            token: localStorage.getItem("token"),
            role: "auth",
            to: s_id,
            user_id: localStorage.getItem("user_id"),
            from: localStorage.getItem("from")
        }
    })
    socket.connect();
    socket.on("ok", () => {
        location.href = "/app";
    });
})();