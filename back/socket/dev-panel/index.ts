import db from "#db";
import { authUser } from "#logic/auth";
import { FCSocket } from "#types/socket";
import {
	Socket_StandardRes,
	Socket_StandardRes_Error,
} from "#types/socket/res";
import SocketEventLimiter, { bannedUsers } from "../chat/limiter";
import { io } from "../server";
import register from "./register";

io.of("/dev-panel").auth(async ({ token }) => {
	if (!token)
		return {
			status: 401,
			msg: "Unauthorized",
		};

	const tokenData = { data: null };
	const user = await authUser(token, tokenData);
	if (!user)
		return {
			status: 401,
			msg: "Unauthorized",
		};

	if (bannedUsers.has(user._id)) {
		const userTime = bannedUsers.get(user._id) as number;
		const remainingTime = userTime - Date.now();
		if (remainingTime > 0) {
			const time = Math.ceil(remainingTime / 1000 / 60) + 1;
			return {
				status: 403,
				msg: `Ban: You are temporarily banned. Please try again after ${time} minutes.`,
			}
		}
	}

	return {
		status: 200,
		user
	};
});

io.of("/dev-panel").onConnect((socket: FCSocket) => {
	socket.logError = (e) => {
		lo("Error: ", e);
		db.logs.c("gl").add({
			error: e.message,
			stackTrace: e.stack,
		});
	};

	const limiter = new SocketEventLimiter(socket);
	socket.onLimit = limiter.onLimit.bind(limiter);

	socket.processSocketError = (res: Socket_StandardRes, cb?: Function) => {
		const err = res.err;
		if (!Array.isArray(err)) return false;

		const [event, ...args] = err as Socket_StandardRes_Error;
		if (cb) cb(...args);
		else socket.emit(event, ...args);
		return true;
	};

	register(socket);
});
