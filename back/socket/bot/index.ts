import db from "#db";
import { Id } from "#id";
import { decode, KeyIndex } from "#logic/token/index";
import Db_BotData from "#types/db/botData";
import { FCSocket } from "#types/socket";
import {
	Socket_StandardRes,
	Socket_StandardRes_Error,
} from "#types/socket/res";
import { Socket_User } from "#types/socket/user";
import SocketEventLimiter, { bannedUsers } from "../chat/limiter";
import { io } from "../server";
import register from "./register";

io.of("/bot").auth(async ({ headers }) => {
	const token = headers.auth as string;
	if (!token) return {
		status: 401,
		msg: "Unauthorized",
	}


	const tokenData = await decode(token, KeyIndex.BOT_TOKEN);
	const _id = tokenData._id as Id;

	const isValid = await db.botData.c(_id).findOne({ token });
	if (!isValid)
		return {
			status: 401,
			msg: "Unauthorized",
		}

	const userName = await db.botData.c<Db_BotData.name>(_id).findOne({ _id: "name" }).then((d) => d.name);

	const user: Socket_User = {
		_id,
		name: userName,
		email: undefined,
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
		} else {
			bannedUsers.delete(user._id);
		}
	}

	return {
		status: 200,
		user
	}
});

io.of("/bot").onConnect((socket: FCSocket) => {
	socket.logError = (e) => {
		lo("Error: ", e);
		db.logs.c("gl").add({
			error: e.message,
			stackTrace: e.stack,
		});
	};

	socket.processSocketError = (res: Socket_StandardRes, cb?: Function) => {
		const err = res.err;
		if (!Array.isArray(err)) return false;

		const [event, ...args] = err as Socket_StandardRes_Error;
		if (cb) cb(...args);
		else socket.emit(event, ...args);
		return true;
	};

	const limiter = new SocketEventLimiter(socket);
	socket.onLimit = limiter.onLimit.bind(limiter);

	register(socket);
});
