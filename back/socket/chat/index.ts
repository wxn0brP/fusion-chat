import { authUser, createUser } from "../../logic/auth";
import mess from "./mess";
import realms from "./realms";
import realmSettings from "./realmSettings";
import voice from "./voice";
import settings from "./settings";
import chats from "./chats";
import evt from "./evt";
import friends from "./friends";
import other from "./other";
import db from "../../dataBase";
import { Socket_User } from "../../types/socket/user";
import { Socket } from "socket.io";
import { Socket_StandardRes, Socket_StandardRes_Error } from "../../types/socket/res";

const tmpBan = new Map();

global.io.of("/").use(async (socket, next) => {
    const authData = socket.handshake.auth;
    if(!authData) return next(new Error("Authentication error: Missing authentication data."));
    
    const token = authData.token;
    if(!token) return next(new Error("Authentication error: Missing authentication data."));
    
    const tokenData = { data: null };
    const user = await authUser(token, tokenData) as Socket_User;
    if(!user) return next(new Error("Authentication error: Missing authentication data."));

    if(tmpBan.has(user._id)){
        const remainingTime = tmpBan.get(user._id) - Date.now();
        if(remainingTime > 0){
            const time = Math.ceil(remainingTime / 1000 / 60);
            return next(new Error(`Ban: You are temporarily banned. Please try again after ${time} minutes.`));
        }else{
            tmpBan.delete(user._id);
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

    socket.timeOutMap = new Map();
    socket.onLimit = (evt, timeout, cb) => {
        socket.on(evt, (...data) => {
            if(!socket.user) return socket.emit("error", "not auth");
            const currentTime = new Date().getTime();
            const lastTime = socket.timeOutMap.get(evt);
            const penalty = 20;
        
            if(lastTime && currentTime - lastTime.t < timeout){
                socket.timeOutMap.set(evt, {
                    t: currentTime,
                    i: lastTime.i + 1
                });
                if(lastTime.i >= 5){
                    socket.timeOutMap.set(evt, {
                        t: currentTime + timeout * penalty,
                        i: lastTime.i + 1
                    });
                    if(lastTime.i == 5){
                        const t = Math.ceil(timeout/1000*penalty+1);
                        socket.emit("error.spam", "last warning", t);
                        db.logs.add("spam", {
                            user: socket.user._id,
                            evt,
                        });
                    }
                    if(lastTime.i == 20){
                        const banTime = currentTime + 10 * 60 * 1000;
                        tmpBan.set(socket.user._id, banTime);
                        const sockets = global.getSocket(socket.user._id);
                        sockets.forEach(socket => {
                            socket.emit("error.spam", "ban");
                            socket.disconnect();
                        });
                        db.logs.add("spam", {
                            user: socket.user._id,
                            evt,
                            ban: true,
                        });
                    }
                }else if(lastTime.i == 2){
                    socket.emit("error.spam", "warn");
                }else if(lastTime.i == 0 || lastTime.i == 1){
                    setTimeout(() => cb(...data), 100);
                }
                return;
            }

            socket.timeOutMap.set(evt, { t: currentTime, i: 0 });
            cb(...data);
        });
    }
    socket.processSocketError = (res: Socket_StandardRes, cb?: Function) => {
        const err = res.err;
        if(!Array.isArray(err)) return false;

        const [event, ...args] = err as Socket_StandardRes_Error;
        if(cb) cb(...args);
        else socket.emit(event, ...args);
        return true;
    }

    mess(socket);
    realms(socket);
    realmSettings(socket);
    voice(socket);
    settings(socket);
    chats(socket);
    friends(socket);
    evt(socket);
    other(socket);

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
