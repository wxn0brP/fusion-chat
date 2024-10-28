import { decode } from "../../logic/auth.js";
import mess from "./mess.js";
import other from "./other.js";
import servers from "./servers.js";
import serverSettings from "./serversSettings.js";
import voice from "./voice.js";

const tmpBan = new Map();

io.of("/bot").use(async (socket, next) => {
    const authData = socket.handshake.auth;
    if(!authData) return next(new Error("Authentication error: Missing authentication data."));

    const token = authData.token;
    if(!token) return next(new Error("Authentication error: Missing authentication data."));

    const tokenData = await decode(token);
    const _id = tokenData._id;


    const isValid = await global.db.botData.findOne(_id, { token });
    if(!isValid) return next(new Error("Authentication error: Missing authentication data."));

    const user = {
        _id,
        name: await global.db.botData.findOne(_id, { _id: "name" }).then(d => d.name),
    }

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
    next();
});

io.of("/bot").on("connection", (socket) => {
    socket.logError = (e) => {
        lo("Error: ", e);
        global.db.logs.add("socket.io", {
            error: e.message,
            stackTrace: e.stack,
        })
    }

    socket.timeOutMap = new Map();
    socket.ontimeout = (evt, timeout, cb) => {
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
                        global.db.logs.add("spam", {
                            user: socket.user._id,
                            evt,
                        });
                    }
                    if(lastTime.i == 20){
                        const banTime = currentTime + 10 * 60 * 1000;
                        tmpBan.set(socket.user._id, banTime);
                        const sockets = getSocket(socket.user._id);
                        sockets.forEach(socket => {
                            socket.emit("error.spam", "ban");
                            socket.disconnect();
                        });
                        global.db.logs.add("spam", {
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

    mess(socket);
    servers(socket);
    serverSettings(socket);
    voice(socket);
    other(socket);
});