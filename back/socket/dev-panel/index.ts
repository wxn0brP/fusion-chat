import db from "#db";
import { authUser } from "#logic/auth";
import { Socket_StandardRes, Socket_StandardRes_Error } from "#types/socket/res";
import { Socket_User } from "#types/socket/user";
import { Socket } from "socket.io";
import SocketEventLimiter, { bannedUsers } from "../chat/limiter";
import register from "./register";

global.io.of("/dev-panel").use(async (socket: Socket, next: Function) => {
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
    next();
});

global.io.of("/dev-panel").on("connection", (socket: Socket) => {
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
});