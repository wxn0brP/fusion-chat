import db from "#db";
import { authUser, createUser } from "#logic/auth";
import { FCSocket } from "#types/socket";
import {
	Socket_StandardRes,
	Socket_StandardRes_Error,
} from "#types/socket/res";
import { io } from "../server";
import evt from "./evt";
import SocketEventLimiter, { bannedUsers } from "./limiter";
import realmSettings from "./realmSettings";
import register from "./register";

io.of("/").auth(async ({ token }) => {
	if (!token) return {
		status: 401,
		msg: "Token not provided",
	}

	const tokenData = { data: null };
	const user = await authUser(token, tokenData);
	if (!user) return {
		status: 401,
		msg: "Unauthorized",
	}

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
		toSet: {
			isShouldRefresh: shouldRefreshToken(tokenData.data),
		},
		user
	}
});

io.of("/").onConnect(async (socket: FCSocket) => {
	socket.joinRoom("user-" + socket.user._id);

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
	realmSettings(socket);
	evt(socket);

	setTimeout(async () => {
		if (socket.isShouldRefresh) {
			const oldToken = socket.authData.token;
			const newToken = await createUser({ _id: socket.user._id });
			socket.emit(
				"system.refreshToken",
				newToken,
				function confirm(confirm: boolean) {
					if (!confirm) return;
					db.data.c("token").updateOne(
						{ token: oldToken },
						{ token: newToken },
					);
				},
			);
		}
		delete socket.isShouldRefresh;
	}, 2_000);
});

function shouldRefreshToken({ iat, exp }) {
	const now = Math.floor(Date.now() / 1000);

	const lifespan = exp - iat;
	const elapsedTime = now - iat;

	return elapsedTime >= lifespan * 0.75; // if 75% of the lifespan has passed, refresh the token
}
