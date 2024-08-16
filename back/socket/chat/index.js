const { auth } = require("../../logic/auth");
const mess = require("./mess");
const servers = require("./servers");
const voice = require("./voice");
const settings = require("./settings");
const chats = require("./chats");
const evt = require("./evt");
const friends = require("./friends");

const tmpBan = new Map();

io.of("/").use(async (socket, next) => {
    const authData = socket.handshake.auth;
    if(!authData) return next(new Error("Authentication error: Missing authentication data."));

    const token = authData.token;
    if(!token) return next(new Error("Authentication error: Missing authentication data."));

    const user = await auth(token);
    if(!user) return next(new Error("Authentication error: Missing authentication data."));

    if(tmpBan.has(user._id)){
        const remainingTime = tmpBan.get(user._id) - Date.now();
        if(remainingTime > 0){
            return next(new Error(`You are temporarily banned. Please try again after ${Math.ceil(remainingTime / 1000 / 60)} minutes.`));
        }else{
            tmpBan.delete(user._id);
        }
    }

    socket.user = user;
    next();
});

io.of("/").on("connection", (socket) => {
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
                        socket.emit("error", `Detected spam. Please wait $ seconds and try again. Your behavior has been logged.`, t);
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
                            socket.emit("error", "Spam detected from your account. You have been temporarily banned due to spam activity.");
                            socket.disconnect();
                        });
                        global.db.logs.add("spam", {
                            user: socket.user._id,
                            evt,
                            ban: true,
                        });
                    }
                }else if(lastTime.i == 2){
                    socket.emit("error", "Spam protection activated. Please wait a moment and try again.");
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
    voice(socket);
    settings(socket);
    chats(socket);
    friends(socket);
    evt(socket);
});