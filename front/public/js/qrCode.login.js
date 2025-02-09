let s_id = null;
let socket = null;

function init() {
    function exit() {
        location.href = "/login?err=true&next=/qr-code-login?k=" + s_id;
    }

    const paramsURL = new URLSearchParams(location.search);
    s_id = paramsURL.get("k");
    if (!s_id) {
        exit();
        return;
    }

    if (!localStorage.getItem("token") || !localStorage.getItem("user_id") || !localStorage.getItem("from")) {
        exit();
        return;
    }

    connect();
    document.querySelector("#account").innerHTML = localStorage.getItem("from");
    document.querySelector("#avatar").src = "/api/profile/img?id=" + localStorage.getItem("user_id");
}

function connect() {
    socket = io("/qrCodeLogin", {
        auth: {
            role: "auth",
            to: s_id,
        }
    });

    socket.on("error", (...err) => {
        alert(err[1]);
    });
    
    socket.on("error.valid", (...err) => {
        if(err[0] == "socket" && err[1] == "socket"){
            alert("No user to auth");
            location.href = "/app";
            return
        }
        alert(err[1]);
    });

    socket.on("device", (device) => {
        const deviceInfo = document.querySelector("#device");
        deviceInfo.innerHTML = device;

        setTimeout(() => {
            const btn = document.querySelector("#accept-btn");
            btn.disabled = false;
            btn.onclick = accept;
        }, 5_000);
    });
}

function accept() {
    socket.emit(
        "auth",
        {
            token: localStorage.getItem("token"),
            _id: localStorage.getItem("user_id"),
            fr: localStorage.getItem("from")
        },
        () => {
            location.href = "/app";
        }
    );
}

init();
document.querySelector("#accept-btn").disabled = true;