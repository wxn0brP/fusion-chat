const valid = require("../../logic/validData");

const friendStatusEnum = {
    NOT_FRIEND: 0,
    IS_FRIEND: 1,
    REQUEST_SENT: 2,
    REQUEST_RECEIVED: 3,
};

module.exports = (socket) => {
    socket.ontimeout("friend.request", 1_000, async (nameOrId) => {
        try{
            if(!socket.user) return socket.emit("error", "not auth");
            if(!valid.str(nameOrId, 0, 30) && !valid.id(nameOrId)) return socket.emit("error", "valid data");

            const userExists = await global.db.data.findOne("user", {
                $or: [
                    { name: nameOrId },
                    { _id: nameOrId }
                ]
            });
            if(!userExists) return socket.emit("error", "user does not exist");
            if(userExists._id == socket.user._id) return socket.emit("error", "can't add yourself");
            const id = userExists._id;

            const friendExists = await global.db.dataGraph.find("friends", { a: socket.user._id, b: id });
            if(friendExists.length > 0) return socket.emit("error", "friend already exists");

            const friendRequestExists = await global.db.data.find("friendRequests", {
                $or: [
                    { from: id, to: socket.user._id },
                    { from: socket.user._id, to: id }
                ]
            });
            if(friendRequestExists.length > 0) return socket.emit("error", "friend request already exists");

            await global.db.data.add("friendRequests", { from: socket.user._id, to: id });
            global.sendToSocket(id, "friend.request", socket.user._id);
            await global.fireBaseMessage.send(id, "Friend request", socket.user.name + " wants to be your friend");
        }catch(e){
            socket.logError(e);
        }
    });

    socket.ontimeout("friend.response", 1_000, async (id, accept) => {
        try{
            if(!socket.user) return socket.emit("error", "not auth");
            if(!valid.id(id)) return socket.emit("error", "valid data");
            if(!valid.bool(accept)) return socket.emit("error", "valid data");
            
            await global.db.data.removeOne("friendRequests", { from: id, to: socket.user._id });

            const friendExists = await global.db.dataGraph.find("friends", { a: socket.user._id, b: id });
            if(friendExists.length > 0) return socket.emit("error", "friend already exists");

            if(accept) await global.db.dataGraph.add("friends", id, socket.user._id);

            global.sendToSocket(id, "friend.response", socket.user._id, accept);
            if(accept) global.sendToSocket(socket.user._id, "refreshData", "friend.getAll");
            global.fireBaseMessage.send(
                id,
                "Friend request",
                socket.user.name + (accept ? " accepted your friend request" : " rejected your friend request")
            );
        }catch(e){
            socket.logError(e);
        }
    });

    socket.ontimeout("friend.requestRemove", 1_000, async (id) => {
        try{
            if(!socket.user) return socket.emit("error", "not auth");
            if(!valid.id(id)) return socket.emit("error", "valid data");

            await global.db.data.removeOne("friendRequests", { from: socket.user._id, to: id });

            global.sendToSocket(id, "refreshData", "friend.getRequests");
        }catch(e){
            socket.logError(e);
        }
    });

    socket.ontimeout("friend.remove", 1_000, async (id) => {
        try{
            if(!socket.user) return socket.emit("error", "not auth");
            if(!valid.id(id)) return socket.emit("error", "valid data");

            const friendExists = await global.db.dataGraph.find("friends", socket.user._id, id);
            if(friendExists.length == 0) return socket.emit("error", "friend does not exist");

            await global.db.dataGraph.remove("friends", socket.user._id, id);

            global.sendToSocket(id, "refreshData", "friend.getAll");
            global.sendToSocket(socket.user._id, "refreshData", "friend.getAll");
        }catch(e){
            socket.logError(e);
        }
    });

    socket.ontimeout("friend.getAll", 1_000, async () => {
        try{
            if(!socket.user) return socket.emit("error", "not auth");
            const friendsGraph = await global.db.dataGraph.find("friends", socket.user._id);
            const friends = friendsGraph.map(f => {
                if(f.a == socket.user._id) return f.b;
                return f.a;
            });

            const friendsStatusPromises = friends.map(async f => {
                const userOnline = global.getSocket(f);
                if(userOnline.length == 0) return {
                    _id: f,
                    status: "offline"
                }

                const status = await global.db.userDatas.findOne(f, { _id: "status" });
                return {
                    _id: f,
                    status: status.status || "online",
                    text: status.text || ""
                }
            });

            const friendsStatus = await Promise.all(friendsStatusPromises);

            socket.emit("friend.getAll", friendsStatus);
        }catch(e){
            socket.logError(e);
        }
    });

    socket.ontimeout("friend.getRequests", 1_000, async () => {
        try{
            if(!socket.user) return socket.emit("error", "not auth");

            const friendRequestsData = await global.db.data.find("friendRequests", { to: socket.user._id });
            const friendRequests = friendRequestsData.map(f => f.from);

            socket.emit("friend.getRequests", friendRequests);
        }catch(e){
            socket.logError(e);
        }
    });

    socket.ontimeout("user.profile", 1000, async (id) => {
        try{
            if(!socket.user) return socket.emit("error", "not auth");
            if(!valid.id(id)) return socket.emit("error", "valid data");

            const userN = await global.db.data.findOne("user", { _id: id });
            if(!userN) return socket.emit("error", "user not found");

            let userStatus = await global.db.userDatas.findOne(socket.user._id, { _id: "status" });
            const userOnline = global.getSocket(id).length > 0;
            if(!userStatus) userStatus = {};

            let userStatusType = "";
            let userStatusText = "";
            if(userOnline) userStatusType = userStatus.status || "online";
            if(userOnline && userStatus.text) userStatusText = userStatus.text;
            if(!userOnline && !userStatusType) userStatusType = "offline";

            let friendStatus = friendStatusEnum.NOT_FRIEND;
            const isFriend = await global.db.dataGraph.findOne("friends", socket.user._id, id);
            if(isFriend){
                friendStatus = friendStatusEnum.IS_FRIEND;
            }else{
                const isFriendRequest = await global.db.data.findOne("friendRequests", {
                    $or: [
                        { from: socket.user._id, to: id },
                        { from: id, to: socket.user._id },
                    ]
                });
                if(isFriendRequest){
                    friendStatus = isFriendRequest.from == socket.user._id
                        ? friendStatusEnum.REQUEST_SENT
                        : friendStatusEnum.REQUEST_RECEIVED;
                }
            }

            const userIsBlocked = await global.db.userDatas.findOne(socket.user._id, { priv: id })

            const userData = {
                name: userN.name,
                status: userStatusType,
                statusText: userStatusText,
                _id: id,
                friendStatus,
                isBlocked: userIsBlocked ? userIsBlocked.blocked : false
            }

            socket.emit("user.profile", userData);
        }catch(e){
            socket.logError(e);
        }
    });
}