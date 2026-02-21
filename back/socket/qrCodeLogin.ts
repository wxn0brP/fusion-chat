import db from "#db";
import { Id } from "#id";
import { authUser, createUser } from "#logic/auth";
import ValidError from "#logic/validError";
import { GLSocket } from "@wxn0brp/gloves-link-server";
import { io } from "./server";

interface Socket_QRCodeLogin extends GLSocket {
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

io.of("/qrCodeLogin").auth(async ({ data }) => {
    if (!data) return { status: 401, msg: "Role not provided" };

    const role = data.role as "get" | "auth";
    if (!role) return { status: 401, msg: "Role not provided" };

    if (role == "auth") {
        if (!data.to) return { status: 401, msg: "To not provided" };
        return { status: 200 };
    }
    if (role == "get") {
        if (!data.id) return { status: 401, msg: "Id not provided" };
        if (!data.device) return { status: 401, msg: "Device not provided" };
        return { status: 200 };
    }

    return { status: 401, msg: "Role not provided" };
});

io.of("/qrCodeLogin").onConnect((socket: Socket_QRCodeLogin, authData) => {
    const auth = authData.data;
    if (auth.role == "get") roleGet(socket, auth as RoleGet_handshake);
    else if (auth.role == "auth") roleAuth(socket, auth as RoleAuth_handshake);
});

function roleGet(socket: Socket_QRCodeLogin, data: RoleGet_handshake) {
    socket.device = data.device;
    socket.joinRoom("qrCodeLogin-" + data.id);
}

function emitError(socket: Socket_QRCodeLogin, error: any) {
    const err = error.err;
    socket.emit(err[0], ...err.slice(1));
}

async function roleAuth(socket: Socket_QRCodeLogin, data: RoleAuth_handshake) {
    const room = io.room("qrCodeLogin-" + data.to);
    if (room.size !== 1)
        return emitError(socket, new ValidError("socket").valid("socket"));

    const to_socket = room.sockets[0] as Socket_QRCodeLogin;
    socket.emit("device", to_socket.device);

    socket.on("auth", async (data: Auth_data, cb?: Function) => {
        const validE = new ValidError("auth");
        if (!data.token) return emitError(socket, validE.valid("token"));
        if (!data._id) return emitError(socket, validE.valid("_id"));
        if (!data.fr) return emitError(socket, validE.valid("fr"));

        const user = await authUser(data.token);
        if (!user) return emitError(socket, validE.err("auth"));

        if (user._id !== data._id) return emitError(socket, validE.err("auth"));
        if (user.name !== data.fr) return emitError(socket, validE.err("auth"));

        const newToken = await createUser(user);
        await db.data.c("token").add({ token: newToken }, false);
        to_socket.emit("get", newToken, user.name, user._id);

        if (cb && typeof cb === "function") cb();
    });
}
