import valid from "../../../logic/validData.js";
import ValidError from "../../../logic/validError.js";
import { getCache as statusMgmtGetCache } from "../../../logic/status.js";
const friendStatusEnum = {
    NOT_FRIEND: 0,
    IS_FRIEND: 1,
    REQUEST_SENT: 2,
    REQUEST_RECEIVED: 3,
};

export async function friend_request(suser, nameOrId){
    const validE = new ValidError("friend.request");
    if(!valid.str(nameOrId, 0, 30) && !valid.id(nameOrId)) return validE.valid("nameOrId");

    const userExists = await global.db.data.findOne("user", {
        $or: [
            { name: nameOrId },
            { _id: nameOrId }
        ]
    });
    if(!userExists) return validE.err("user does not exist");
    if(userExists._id == suser._id) return validE.err("can't add yourself");
    const id = userExists._id;

    const friendExists = await global.db.dataGraph.find("friends", { a: suser._id, b: id });
    if(friendExists.length > 0) return validE.err("friend already exists");

    const friendRequestExists = await global.db.data.find("friendRequests", {
        $or: [
            { from: id, to: suser._id },
            { from: suser._id, to: id }
        ]
    });
    if(friendRequestExists.length > 0) return validE.err("friend request already exists");

    await global.db.data.add("friendRequests", { from: suser._id, to: id });
    global.sendToSocket(id, "friend.request", suser._id);
    await global.fireBaseMessage.send({
        to: id,
        title: "Friend request",
        body: suser.name + " wants to be your friend"
    });
    return { err: false };
}

export async function friend_response(suser, id, accept){
    const validE = new ValidError("friend.response");
    if(!valid.id(id)) return validE.valid("id");
    if(!valid.bool(accept)) return validE.valid("accept");
    
    await global.db.data.removeOne("friendRequests", { from: id, to: suser._id });

    const friendExists = await global.db.dataGraph.find("friends", { a: suser._id, b: id });
    if(friendExists.length > 0) return validE.err("friend already exists");

    if(accept) await global.db.dataGraph.add("friends", id, suser._id);

    global.sendToSocket(id, "friend.response", suser._id, accept);
    if(accept) global.sendToSocket(suser._id, "refreshData", "friend.getAll");
    global.fireBaseMessage.send({
        to: id,
        title: "Friend request",
        body: suser.name + (accept ? " accepted your friend request" : " rejected your friend request")
    });
    return { err: false };
}

export async function friend_requestRemove(suser, id){
    const validE = new ValidError("friend.requestRemove");
    if(!valid.id(id)) return validE.valid("id");

    await global.db.data.removeOne("friendRequests", { from: suser._id, to: id });

    global.sendToSocket(id, "refreshData", "friend.getRequests");
    return { err: false };
}

export async function friend_remove(suser, id){
    const validE = new ValidError("friend.remove");
    if(!valid.id(id)) return validE.valid("id");

    const friendExists = await global.db.dataGraph.find("friends", suser._id, id);
    if(friendExists.length == 0) return validE.err("friend does not exist");

    await global.db.dataGraph.remove("friends", suser._id, id);

    global.sendToSocket(id, "refreshData", "friend.getAll");
    global.sendToSocket(suser._id, "refreshData", "friend.getAll");
    return { err: false };
}

export async function friend_getAll(suser){
    const friendsGraph = await global.db.dataGraph.find("friends", suser._id);
    const friends = friendsGraph.map(f => {
        if(f.a == suser._id) return f.b;
        return f.a;
    });

    const friendsStatusPromises = friends.map(async f => {
        const userOnline = global.getSocket(f);
        if(userOnline.length == 0) return {
            _id: f,
            status: "offline"
        }

        const status = await global.db.userData.findOne(f, { _id: "status" });
        return {
            _id: f,
            status: status.status || "online",
            text: status.text || ""
        }
    });

    const friendsStatus = await Promise.all(friendsStatusPromises);

    return { err: false, res: friendsStatus };
}

export async function friend_getRequests(suser){
    const friendRequestsData = await global.db.data.find("friendRequests", { to: suser._id });
    const friendRequests = friendRequestsData.map(f => f.from);
    return { err: false, res: friendRequests };
}

export async function user_profile(suser, id){
    const validE = new ValidError("user.profile");
    if(!valid.id(id)) return validE.valid("id");

    const userN = await global.db.data.findOne("user", { _id: id });
    if(!userN) return validE.err("user not found");

    let userStatus = await global.db.userData.findOne(id, { _id: "status" });
    const userOnline = global.getSocket(id).length > 0;
    if(!userStatus) userStatus = {};

    let userStatusType = "";
    let userStatusText = "";
    if(userOnline) userStatusType = userStatus.status || "online";
    if(userOnline && userStatus.text) userStatusText = userStatus.text;
    if(!userOnline && !userStatusType) userStatusType = "offline";

    let friendStatus = friendStatusEnum.NOT_FRIEND;
    const isFriend = await global.db.dataGraph.findOne("friends", suser._id, id);
    if(isFriend){
        friendStatus = friendStatusEnum.IS_FRIEND;
    }else{
        const isFriendRequest = await global.db.data.findOne("friendRequests", {
            $or: [
                { from: suser._id, to: id },
                { from: id, to: suser._id },
            ]
        });
        if(isFriendRequest){
            friendStatus = isFriendRequest.from == suser._id
                ? friendStatusEnum.REQUEST_SENT
                : friendStatusEnum.REQUEST_RECEIVED;
        }
    }

    const userIsBlocked = await global.db.userData.findOne(suser._id, { priv: id })

    const userData = {
        name: userN.name,
        status: userStatusType,
        statusText: userStatusText,
        _id: id,
        friendStatus,
        isBlocked: userIsBlocked ? userIsBlocked.blocked : false,
        activity: statusMgmtGetCache(id) || {},
    }

    return { err: false, res: userData };
}