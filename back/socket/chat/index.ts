import evt from "./evt";
import voice from "./voice";
import db from "#db";
import register from "./register";
import { Socket } from "socket.io";
import realmSettings from "./realmSettings";
import { Socket_User } from "#types/socket/user";
import { authUser, createUser } from "#logic/auth";
import SocketEventLimiter, { bannedUsers } from "./limiter";
import { Socket_StandardRes, Socket_StandardRes_Error } from "#types/socket/res";

global.io.of("/").use(async (socket: Socket, next: Function) => {
    const authData = socket.handshake.auth;
    if(!authData) return next(new Error("Authentication error: Missing authentication data."));
    
    const token = authData.token;
    if(!token) return next(new Error("Authentication error: Missing authentication data."));
    
    const tokenData = { data: null };
    const user = await authUser(token, tokenData) as Socket_User;
    if(!user) return next(new Error("Authentication error: Missing authentication data."));

    if(bannedUsers.has(user._id)){
        const userTime = bannedUsers.get(user._id) as number;
        const remainingTime = userTime - Date.now();
        if(remainingTime > 0){
            const time = Math.ceil(remainingTime / 1000 / 60) + 1;
            return next(new Error(`Ban: You are temporarily banned. Please try again after ${time} minutes.`));
        }
    }

    socket.user = user;
    socket.isShouldRefresh = shouldRefreshToken(tokenData.data);
    next();
});

global.io.of("/").on("connection", (socket: Socket) => {
    socket.logError = (e) => {
        lo("Error: ", e);
        db.logs.add("socket.io", {
            error: e.message,
            stackTrace: e.stack,
        })
    }

    const limiter = new SocketEventLimiter(socket);
    socket.onLimit = limiter.onLimit.bind(limiter);
    
    socket.processSocketError = (res: Socket_StandardRes, cb?: Function) => {
        const err = res.err;
        if(!Array.isArray(err)) return false;

        const [event, ...args] = err as Socket_StandardRes_Error;
        if(cb) cb(...args);
        else socket.emit(event, ...args);
        return true;
    }

    register(socket);
    realmSettings(socket);
    voice(socket);
    evt(socket);

    setTimeout(async () => {
        if(socket.isShouldRefresh){
            const oldToken = socket.handshake.auth.token;
            const newToken = await createUser({ _id: socket.user._id });
            socket.emit("system.refreshToken", newToken, function confirm(confirm: boolean){
                if(!confirm) return;
                db.data.updateOne("token", { token: oldToken }, { token: newToken });
            });
        }
        delete socket.isShouldRefresh;
    }, 2_000);
});

function shouldRefreshToken({ iat, exp } ){
    const now = Math.floor(Date.now() / 1000);

    const lifespan = exp - iat;
    const elapsedTime = now - iat;

    return elapsedTime >= lifespan * 0.75; // if 75% of the lifespan has passed, refresh the token
}
