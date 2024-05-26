apis.api.send = (data) => {
    window.ReactNativeWebView.postMessage(JSON.stringify(data));
}

apis.api.receiveMessage = (data) => {
    data = JSON.parse(data);
    switch(data.type){
        case "debug":
            debugFunc.msg(data.msg);
        break;
        case "close":
            socket.disconnect();
            uiFunc.uiMsg("Disconnected from server!");
        break;
        case "unclose":
            socket.connect();
            uiFunc.uiMsg("Connected to server!");
        break;
    }
}

setTimeout(() => {
    apis.api.send({
        type: "firebase",
        _id: vars.user._id,
        user: vars.user.fr,
    });
}, 1000);

// setTimeout(() => {
//     apis.api.send({
//         type: "notif",
//         msg: "test",
//         title: "test",
//     });
// }, 5000);