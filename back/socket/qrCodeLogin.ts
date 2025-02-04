import { Socket } from "socket.io";
import { authUser, createUser } from "../logic/auth";
import { Socket_User } from "../types/socket/user";
import { Id } from "../types/base";
import db from "../dataBase";
import ValidError from "../logic/validError";

interface Socket_QRCodeLogin extends Socket {
    _idK: string;
    device: string;
}

interface RoleGet_handshake {
    role: "get";
    id: string;
    device: string;
}

interface RoleAuth_handshake {
    role: "auth";
    to: string;
}

interface Auth_data {
    token: string;
    _id: Id;
    fr: string;
}

global.io.of("/qrCodeLogin", (socket: Socket_QRCodeLogin) => {
    const auth = socket.handshake.auth as RoleGet_handshake | RoleAuth_handshake;
    if(!auth || !auth.role) return;

    if(auth.role == "get") roleGet(socket);
    else if(auth.role == "auth") roleAuth(socket);
});

function roleGet(socket: Socket_QRCodeLogin){
    const auth = socket.handshake.auth as RoleGet_handshake;

    if(!auth.id) return;
    if(!auth.device) return;
    socket._idK = auth.id;
    socket.device = auth.device;
}

function emitError(socket: Socket_QRCodeLogin, error: any){
    const err = error.err;
    socket.emit(err[0], ...err.slice(1));
}

async function roleAuth(socket: Socket_QRCodeLogin){
    const auth = socket.handshake.auth as RoleAuth_handshake;
    if(!auth.to) return;

    const namespace = global.io.of("/qrCodeLogin");
    const sockets: Socket_QRCodeLogin[] = Array.from(namespace.sockets.values());
    const filtered: Socket_QRCodeLogin[] = sockets.filter(socket => (socket as any)._idK === auth.to);
    if(filtered.length !== 1) return emitError(socket, new ValidError("socket").valid("socket"));

    const to_socket = filtered[0];
    socket.emit("device", to_socket.device);

    socket.on("auth", async (data: Auth_data, cb?: Function) => {
        const validE = new ValidError("auth");
        if(!data.token) return emitError(socket, validE.valid("token"));
        if(!data._id) return emitError(socket, validE.valid("_id"));
        if(!data.fr) return emitError(socket, validE.valid("fr"));

        const user = await authUser(data.token) as Socket_User;
        if(!user) return emitError(socket, validE.err("auth"));

        if (user._id !== data._id) return emitError(socket, validE.err("auth"));
        if (user.name !== data.fr) return emitError(socket, validE.err("auth"));

        const newToken = await createUser(user);
        await db.data.add("token", { token: newToken }, false);
        to_socket.emit("get", newToken, user.name, user._id);

        if(cb && typeof cb === "function") cb();
    });
}