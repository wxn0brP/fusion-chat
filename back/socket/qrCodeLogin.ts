import { Socket } from "socket.io";
import { authUser, createUser } from "../logic/auth";
import { Socket_User } from "../types/socket/user";

global.io.of("/qrCodeLogin", async (socket) => {
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

    const user = await authUser(auth.token) as Socket_User;
    if(!user) return;

    const newToken = await createUser(user);
    const namespace = global.io.of("/qrCodeLogin");
    const sockets: Socket[] = Array.from(namespace.sockets.values());
    const filtered: Socket[] = sockets.filter(socket => (socket as any)._idK === auth.to);
    filtered.forEach(s => {
        s.emit("get", newToken, auth.from, auth.user_id);
    });
    socket.emit("ok");
});