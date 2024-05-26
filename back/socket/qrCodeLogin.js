const authF = require("../logic/auth");

io.of("/qrCodeLogin", async (socket) => {
    const auth = socket.handshake.auth;
    if(!auth || !auth.role) return;

    if(auth.role == "get"){
        if(!auth.id) return;
        socket._idK = auth.id;
        return;
    }

    if(auth.role != "auth") return;
    if(!auth.token) return;
    if(!auth.to) return;
    if(!auth.user_id) return;
    if(!auth.from) return;

    const user = await authF.auth(auth.token);
    if(!user) return;

    const newToken = authF.create(user);
    const namespace = io.of("/qrCodeLogin");
    const sockets = Array.from(namespace.sockets.values());
    const filtered = sockets.filter(socket => socket._idK === auth.to);
    filtered.forEach(s => {
        s.emit("get", newToken, auth.from, auth.user_id);
    });
    socket.emit("ok");
});