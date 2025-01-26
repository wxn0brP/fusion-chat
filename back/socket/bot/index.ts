import db from "../../dataBase";
import register from "./register";
import { Socket } from "socket.io";
import { Id } from "../../types/base";
import Db_BotData from "../../types/db/botData";
import SocketEventLimiter, { bannedUsers } from "../chat/limiter";
import { decode, KeyIndex } from "../../logic/token/index";
import { Socket_User } from "../../types/socket/user";
import { Socket_StandardRes, Socket_StandardRes_Error } from "../../types/socket/res";
import voice from "../chat/voice";

global.io.of("/bot").use(async (socket: Socket, next: Function) => {
    const authData = socket.handshake.auth;
    if (!authData) return next(new Error("Authentication error: Missing authentication data."));

    const token = authData.token;
    if (!token) return next(new Error("Authentication error: Missing authentication data."));

    const tokenData = await decode(token, KeyIndex.BOT_TOKEN);
    const _id = tokenData._id as Id;

    const isValid = await db.botData.findOne(_id, { token });
    if (!isValid) return next(new Error("Authentication error: Missing authentication data."));

    const user: Socket_User = {
        _id,
        name: await db.botData.findOne<Db_BotData.name>(_id, { _id: "name" }).then(d => d.name),
        email: undefined,
    }

    if (bannedUsers.has(user._id)) {
        const userTime = bannedUsers.get(user._id) as number;
        const remainingTime = userTime - Date.now();
        if (remainingTime > 0) {
            const time = Math.ceil(remainingTime / 1000 / 60) + 1;
            return next(new Error(`Ban: You are temporarily banned. Please try again after ${time} minutes.`));
        }
    }

    socket.user = user;
    next();
});

global.io.of("/bot").on("connection", (socket: Socket) => {
    socket.logError = (e) => {
        lo("Error: ", e);
        db.logs.add("socket.io", {
            error: e.message,
            stackTrace: e.stack,
        })
    }

    socket.processSocketError = (res: Socket_StandardRes, cb?: Function) => {
        const err = res.err;
        if (!Array.isArray(err)) return false;

        const [event, ...args] = err as Socket_StandardRes_Error;
        if (cb) cb(...args);
        else socket.emit(event, ...args);
        return true;
    }

    const limiter = new SocketEventLimiter(socket);
    socket.onLimit = limiter.onLimit.bind(limiter);

    register(socket);
    voice(socket);
});

export { };