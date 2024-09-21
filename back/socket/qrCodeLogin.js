import { auth as _auth, create } from "../logic/auth.js";

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

    const user = await _auth(auth.token);
    if(!user) return;

    const newToken = create(user);
    const namespace = io.of("/qrCodeLogin");
    const sockets = Array.from(namespace.sockets.values());
    const filtered = sockets.filter(socket => socket._idK === auth.to);
    filtered.forEach(s => {
        s.emit("get", newToken, auth.from, auth.user_id);
    });
    socket.emit("ok");
});