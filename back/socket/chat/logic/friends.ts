import valid from "../../../logic/validData";
import ValidError from "../../../logic/validError";
import { getCache as statusMgmtGetCache } from "../../../logic/status";
import db from "../../../dataBase";
import Db_Data from "../../../types/db/data";
import Db_UserData from "../../../types/db/userData";
import { Socket_StandardRes } from "../../../types/socket/res";
import { Id } from "../../../types/base";
import { Socket_User } from "../../../types/socket/user";
import InternalCode from "../../../codes";
import firebaseSend from "../../../firebase";

enum friendStatusEnum {
    NOT_FRIEND,
    IS_FRIEND,
    REQUEST_SENT,
    REQUEST_RECEIVED,
}

export async function friend_request(suser: Socket_User, nameOrId: string): Promise<Socket_StandardRes> {
    const validE = new ValidError("friend.request");
    if (!valid.str(nameOrId, 0, 30) && !valid.id(nameOrId)) return validE.valid("nameOrId");

    const userExists = await db.data.findOne<Db_Data.user>("user", {
        $or: [
            { name: nameOrId },
            { _id: nameOrId }
        ]
    });
    if (!userExists) return validE.err(InternalCode.UserError.Socket.FriendRequest_UserNotFound);
    if (userExists._id == suser._id) return validE.err(InternalCode.UserError.Socket.FriendRequest_Self);
    const id = userExists._id;

    const friendExists = await db.dataGraph.findOne("friends", suser._id, id);
    if (friendExists) return validE.err(InternalCode.UserError.Socket.FriendRequest_AlreadyFriend);

    const friendRequestExists = await db.data.find("friendRequests", {
        $or: [
            { from: id, to: suser._id },
            { from: suser._id, to: id }
        ]
    });
    if (friendRequestExists.length > 0) return validE.err(InternalCode.UserError.Socket.FriendRequest_AlreadySent);

    await db.data.add("friendRequests", { from: suser._id, to: id }, false);
    global.sendToSocket(id, "friend.request", suser._id);
    await firebaseSend({
        to: id,
        title: "Friend request",
        body: suser.name + " wants to be your friend"
    });
    return { err: false };
}

export async function friend_response(suser: Socket_User, id: Id, accept: boolean): Promise<Socket_StandardRes> {
    const validE = new ValidError("friend.response");
    if (!valid.id(id)) return validE.valid("id");
    if (!valid.bool(accept)) return validE.valid("accept");

    await db.data.removeOne("friendRequests", { from: id, to: suser._id });

    const friendExists = await db.dataGraph.findOne("friends", suser._id, id);
    if (friendExists) return validE.err(InternalCode.UserError.Socket.FriendRequest_AlreadyFriend);

    if (accept) await db.dataGraph.add("friends", id, suser._id);

    global.sendToSocket(id, "friend.response", suser._id, accept);
    if (accept) global.sendToSocket(suser._id, "refreshData", "friend.get.all");
    firebaseSend({
        to: id,
        title: "Friend request",
        body: suser.name + (accept ? " accepted your friend request" : " rejected your friend request")
    });
    return { err: false };
}

export async function friend_request_remove(suser: Socket_User, id: Id): Promise<Socket_StandardRes> {
    const validE = new ValidError("friend.request.remove");
    if (!valid.id(id)) return validE.valid("id");

    await db.data.removeOne("friendRequests", { from: suser._id, to: id });

    global.sendToSocket(id, "refreshData", "friend.requests.get");
    return { err: false };
}

export async function friend_remove(suser: Socket_User, id: Id): Promise<Socket_StandardRes> {
    const validE = new ValidError("friend.remove");
    if (!valid.id(id)) return validE.valid("id");

    const friendExists = await db.dataGraph.findOne("friends", suser._id, id);
    if (!friendExists) return validE.err(InternalCode.UserError.Socket.FriendRemove_FriendNotFound);

    await db.dataGraph.remove("friends", suser._id, id);

    global.sendToSocket(id, "refreshData", "friend.get.all");
    global.sendToSocket(suser._id, "refreshData", "friend.get.all");
    return { err: false };
}

export async function friend_get_all(suser: Socket_User): Promise<Socket_StandardRes> {
    const friendsGraph = await db.dataGraph.find("friends", suser._id);
    const friends = friendsGraph.map(f => {
        if (f.a == suser._id) return f.b;
        return f.a;
    });

    const friendsStatusPromises = friends.map(async f => {
        const userOnline = global.getSocket(f);
        if (userOnline.length == 0) return {
            _id: f,
            status: "offline"
        }

        const status = await db.userData.findOne<Db_UserData.status>(f, { _id: "status" });
        return {
            _id: f,
            status: status?.status || "online",
            text: status?.text || ""
        }
    });

    const friendsStatus = await Promise.all(friendsStatusPromises);

    return { err: false, res: [friendsStatus] };
}

export async function friend_requests_get(suser: Socket_User): Promise<Socket_StandardRes> {
    const friendRequestsData = await db.data.find<Db_Data.friendRequest>("friendRequests", { to: suser._id }) as Db_Data.friendRequest[];
    const friendRequests = friendRequestsData.map(f => f.from);
    return { err: false, res: [friendRequests] };
}

export async function user_profile(suser: Socket_User, id: Id): Promise<Socket_StandardRes> {
    const validE = new ValidError("user.profile");
    if (!valid.id(id)) return validE.valid("id");

    const userN = await db.data.findOne<Db_Data.user>("user", { _id: id });
    if (!userN) return validE.err(InternalCode.UserError.Socket.UserProfile_UserNotFound);

    let userStatus = await db.userData.findOne<Partial<Db_UserData.status>>(id, { _id: "status" });
    const userOnline = global.getSocket(id).length > 0;
    if (!userStatus) userStatus = {};

    let userStatusType = "";
    let userStatusText = "";
    if (userOnline) userStatusType = userStatus?.status || "online";
    if (userOnline && userStatus.text) userStatusText = userStatus?.text;
    if (!userOnline && !userStatusType) userStatusType = "offline";

    let friendStatus = friendStatusEnum.NOT_FRIEND;
    const isFriend = await db.dataGraph.findOne("friends", suser._id, id);
    if (isFriend) {
        friendStatus = friendStatusEnum.IS_FRIEND;
    } else {
        const isFriendRequest = await db.data.findOne<Db_Data.friendRequest>("friendRequests", {
            $or: [
                { from: suser._id, to: id },
                { from: id, to: suser._id },
            ]
        });
        if (isFriendRequest) {
            friendStatus = isFriendRequest.from == suser._id
                ? friendStatusEnum.REQUEST_SENT
                : friendStatusEnum.REQUEST_RECEIVED;
        }
    }

    const userIsBlocked = await db.userData.findOne("blocked", { fr: suser._id, to: id });

    const userData = {
        name: userN.name,
        status: userStatusType,
        statusText: userStatusText,
        _id: id,
        friendStatus,
        isBlocked: !!userIsBlocked,
        activity: statusMgmtGetCache(id) || {},
    }

    return { err: false, res: [userData] };
}