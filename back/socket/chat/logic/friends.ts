import InternalCode from "#codes";
import db from "#db";
import firebaseSend from "#firebase";
import { getCache as statusMgmtGetCache } from "#logic/status";
import valid from "#logic/validData";
import ValidError from "#logic/validError";
import { Id } from "#id";
import Db_Data from "#types/db/data";
import Db_UserData from "#types/db/userData";
import { Socket_StandardRes } from "#types/socket/res";
import { Socket_User } from "#types/socket/user";
import { io } from "../../server";
import { sendToUser } from "../..";

enum friendStatusEnum {
	NOT_FRIEND,
	IS_FRIEND,
	REQUEST_SENT,
	REQUEST_RECEIVED,
}

export async function friend_request(
	suser: Socket_User,
	nameOrId: string,
): Promise<Socket_StandardRes> {
	const validE = new ValidError("friend.request");
	if (!valid.str(nameOrId, 0, 30) && !valid.id(nameOrId))
		return validE.valid("nameOrId");

	const userExists = await db.data.c("user").findOne({
		$or: [{ name: nameOrId }, { _id: nameOrId }],
	});
	if (!userExists)
		return validE.err(
			InternalCode.UserError.Socket.FriendRequest_UserNotFound,
		);
	if (userExists._id == suser._id)
		return validE.err(InternalCode.UserError.Socket.FriendRequest_Self);
	const id = userExists._id;

	const friendExists = await db.dataGraph.c("friends").findOne({ $or: [{ a: suser._id, b: id }, { a: id, b: suser._id }] });
	if (friendExists)
		return validE.err(
			InternalCode.UserError.Socket.FriendRequest_AlreadyFriend,
		);

	const friendRequestExists = await db.data.c("friendRequests").find({
		$or: [
			{ from: id, to: suser._id },
			{ from: suser._id, to: id },
		],
	});
	if (friendRequestExists.length > 0)
		return validE.err(
			InternalCode.UserError.Socket.FriendRequest_AlreadySent,
		);

	await db.data.c("friendRequests").add({ from: suser._id, to: id }, false);
	sendToUser(id, "friend.request", suser._id);
	await firebaseSend({
		to: id,
		title: "Friend request",
		body: suser.name + " wants to be your friend",
	});
	return { err: false };
}

export async function friend_response(
	suser: Socket_User,
	id: Id,
	accept: boolean,
): Promise<Socket_StandardRes> {
	const validE = new ValidError("friend.response");
	if (!valid.id(id)) return validE.valid("id");
	if (!valid.bool(accept)) return validE.valid("accept");

	await db.data.c("friendRequests").removeOne({ from: id, to: suser._id });

	const friendExists = await db.dataGraph.c("friends").findOne({ $or: [{ a: suser._id, b: id }, { a: id, b: suser._id }] });
	if (friendExists)
		return validE.err(
			InternalCode.UserError.Socket.FriendRequest_AlreadyFriend,
		);

	if (accept) await db.dataGraph.c("friends").add({ a: id, b: suser._id }, false);

	sendToUser(id, "friend.response", suser._id, accept);
	if (accept) sendToUser(suser._id, "refreshData", "friend.get.all");
	firebaseSend({
		to: id,
		title: "Friend request",
		body:
			suser.name +
			(accept
				? " accepted your friend request"
				: " rejected your friend request"),
	});
	return { err: false };
}

export async function friend_request_remove(
	suser: Socket_User,
	id: Id,
): Promise<Socket_StandardRes> {
	const validE = new ValidError("friend.request.remove");
	if (!valid.id(id)) return validE.valid("id");

	await db.data.c("friendRequests").removeOne({ from: suser._id, to: id });

	sendToUser(id, "refreshData", "friend.requests.get");
	return { err: false };
}

export async function friend_remove(
	suser: Socket_User,
	id: Id,
): Promise<Socket_StandardRes> {
	const validE = new ValidError("friend.remove");
	if (!valid.id(id)) return validE.valid("id");

	const friendExists = await db.dataGraph.c("friends").findOne({ $or: [{ a: suser._id, b: id }, { a: id, b: suser._id }] });
	if (!friendExists)
		return validE.err(
			InternalCode.UserError.Socket.FriendRemove_FriendNotFound,
		);

	await db.dataGraph.c("friends").removeOne({ $or: [{ a: suser._id, b: id }, { a: id, b: suser._id }] });

	sendToUser(id, "refreshData", "friend.get.all");
	sendToUser(suser._id, "refreshData", "friend.get.all");
	return { err: false };
}

export async function friend_get_all(
	suser: Socket_User,
): Promise<Socket_StandardRes> {
	const friendsGraph = await db.dataGraph.c("friends").find({ $or: [{ a: suser._id }, { b: suser._id }] });
	const friends = friendsGraph.map((f) => {
		if (f.a == suser._id) return f.b;
		return f.a;
	});

	const friendsStatusPromises = friends.map(async (f) => {
		const userOnline = io.room("user-" + f).size;
		if (userOnline == 0)
			return {
				_id: f,
				status: "offline",
			};

		const status = await db.userData.c<Db_UserData.status>(f).findOne({
			_id: "status",
		});
		return {
			_id: f,
			status: status?.status || "online",
			text: status?.text || "",
		};
	});

	const friendsStatus = await Promise.all(friendsStatusPromises);

	return { err: false, res: [friendsStatus] };
}

export async function friend_requests_get(
	suser: Socket_User,
): Promise<Socket_StandardRes> {
	const friendRequestsData = await db.data.c<Db_Data.friendRequest>("friendRequests").find(
		{ to: suser._id },
	)
	const friendRequests = friendRequestsData.map((f) => f.from);
	return { err: false, res: [friendRequests] };
}

export async function user_profile(
	suser: Socket_User,
	id: Id,
): Promise<Socket_StandardRes> {
	const validE = new ValidError("user.profile");
	if (!valid.id(id)) return validE.valid("id");

	const userN = await db.data.c<Db_Data.user>("user").findOne({ _id: id });
	if (!userN)
		return validE.err(
			InternalCode.UserError.Socket.UserProfile_UserNotFound,
		);

	let userStatus = await db.userData.c<Partial<Db_UserData.status>>(id).findOne({ _id: "status", });
	const userOnline = io.room("user-" + id).size > 0;
	if (!userStatus) userStatus = {};

	let userStatusType = "";
	let userStatusText = "";
	if (userOnline) userStatusType = userStatus?.status || "online";
	if (userOnline && userStatus.text) userStatusText = userStatus?.text;
	if (!userOnline && !userStatusType) userStatusType = "offline";

	let friendStatus = friendStatusEnum.NOT_FRIEND;
	const isFriend = await db.dataGraph.c("friends").findOne({ $or: [{ a: suser._id, b: id }, { a: id, b: suser._id }] });
	if (isFriend) {
		friendStatus = friendStatusEnum.IS_FRIEND;
	} else {
		const isFriendRequest = await db.data.c<Db_Data.friendRequest>("friendRequests").findOne(
			{
				$or: [
					{ from: suser._id, to: id },
					{ from: id, to: suser._id },
				],
			},
		);
		if (isFriendRequest) {
			friendStatus =
				isFriendRequest.from == suser._id
					? friendStatusEnum.REQUEST_SENT
					: friendStatusEnum.REQUEST_RECEIVED;
		}
	}

	const userIsBlocked = await db.data.c("blocked").findOne({
		fr: suser._id,
		to: id,
	});

	const userData = {
		name: userN.name,
		status: userStatusType,
		statusText: userStatusText,
		_id: id,
		friendStatus,
		isBlocked: !!userIsBlocked,
		activity: statusMgmtGetCache(id) || {},
	};

	return { err: false, res: [userData] };
}
