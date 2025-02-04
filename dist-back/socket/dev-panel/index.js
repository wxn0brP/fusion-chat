import db from "../../dataBase.js";
import { authUser } from "../../logic/auth.js";
import botsMgmt from "./botsMgmt.js";
import editBot from "./editBot.js";
const tmpBan = new Map();
global.io.of("/dev-panel").use(async (socket, next) => {
    const authData = socket.handshake.auth;
    if (!authData)
        return next(new Error("Authentication error: Missing authentication data."));
    const token = authData.token;
    if (!token)
        return next(new Error("Authentication error: Missing authentication data."));
    const user = await authUser(token);
    if (!user)
        return next(new Error("Authentication error: Missing authentication data."));
    if (tmpBan.has(user._id)) {
        const remainingTime = tmpBan.get(user._id) - Date.now();
        if (remainingTime > 0) {
            const time = Math.ceil(remainingTime / 1000 / 60);
            return next(new Error(`Ban: You are temporarily banned. Please try again after ${time} minutes.`));
        }
        else {
            tmpBan.delete(user._id);
        }
    }
    socket.user = user;
    next();
});
global.io.of("/dev-panel").on("connection", (socket) => {
    socket.logError = (e) => {
        lo("Error: ", e);
        db.logs.add("socket.io", {
            error: e.message,
            stackTrace: e.stack,
        });
    };
    socket.timeOutMap = new Map();
    socket.onLimit = (evt, timeout, cb) => {
        socket.on(evt, (...data) => {
            if (!socket.user)
                return socket.emit("error", "not auth");
            const currentTime = new Date().getTime();
            const lastTime = socket.timeOutMap.get(evt);
            const penalty = 20;
            if (lastTime && currentTime - lastTime.t < timeout) {
                socket.timeOutMap.set(evt, {
                    t: currentTime,
                    i: lastTime.i + 1
                });
                if (lastTime.i >= 5) {
                    socket.timeOutMap.set(evt, {
                        t: currentTime + timeout * penalty,
                        i: lastTime.i + 1
                    });
                    if (lastTime.i == 5) {
                        const t = Math.ceil(timeout / 1000 * penalty + 1);
                        socket.emit("error.spam", "last warning", t);
                        db.logs.add("spam", {
                            user: socket.user._id,
                            evt,
                        });
                    }
                    if (lastTime.i == 20) {
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
                }
                else if (lastTime.i == 2) {
                    socket.emit("error.spam", "warn");
                }
                else if (lastTime.i == 0 || lastTime.i == 1) {
                    setTimeout(() => cb(...data), 100);
                }
                return;
            }
            socket.timeOutMap.set(evt, { t: currentTime, i: 0 });
            cb(...data);
        });
    };
    botsMgmt(socket);
    editBot(socket);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9iYWNrL3NvY2tldC9kZXYtcGFuZWwvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLE1BQU0sZ0JBQWdCLENBQUM7QUFDaEMsT0FBTyxFQUFFLFFBQVEsRUFBRSxNQUFNLGtCQUFrQixDQUFDO0FBRTVDLE9BQU8sUUFBUSxNQUFNLFlBQVksQ0FBQztBQUNsQyxPQUFPLE9BQU8sTUFBTSxXQUFXLENBQUM7QUFFaEMsTUFBTSxNQUFNLEdBQUcsSUFBSSxHQUFHLEVBQUUsQ0FBQztBQUV6QixNQUFNLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxZQUFZLENBQUMsQ0FBQyxHQUFHLENBQUMsS0FBSyxFQUFFLE1BQU0sRUFBRSxJQUFJLEVBQUUsRUFBRTtJQUNsRCxNQUFNLFFBQVEsR0FBRyxNQUFNLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQztJQUN2QyxJQUFHLENBQUMsUUFBUTtRQUFFLE9BQU8sSUFBSSxDQUFDLElBQUksS0FBSyxDQUFDLG9EQUFvRCxDQUFDLENBQUMsQ0FBQztJQUUzRixNQUFNLEtBQUssR0FBRyxRQUFRLENBQUMsS0FBSyxDQUFDO0lBQzdCLElBQUcsQ0FBQyxLQUFLO1FBQUUsT0FBTyxJQUFJLENBQUMsSUFBSSxLQUFLLENBQUMsb0RBQW9ELENBQUMsQ0FBQyxDQUFDO0lBRXhGLE1BQU0sSUFBSSxHQUFHLE1BQU0sUUFBUSxDQUFDLEtBQUssQ0FBZ0IsQ0FBQztJQUNsRCxJQUFHLENBQUMsSUFBSTtRQUFFLE9BQU8sSUFBSSxDQUFDLElBQUksS0FBSyxDQUFDLG9EQUFvRCxDQUFDLENBQUMsQ0FBQztJQUV2RixJQUFHLE1BQU0sQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFDLENBQUM7UUFDckIsTUFBTSxhQUFhLEdBQUcsTUFBTSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEdB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