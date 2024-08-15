const valid = require("../../logic/validData");

module.exports = (socket) => {
    socket.ontimeout("requestFriend", 1_000, async (nameOrId) => {
        try{
            if(!socket.user) return socket.emit("error", "not auth");
            if(!valid.str(nameOrId, 0, 30) || !valid.id(nameOrId)) return socket.emit("error", "valid data");

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
            global.sendToSocket(id, "requestFriend", socket.user._id);
        }catch(e){
            socket.logError(e);
        }
    });

    socket.ontimeout("requestFriendResponse", 1_000, async (id, accept) => {
        try{
            if(!socket.user) return socket.emit("error", "not auth");
            if(!valid.id(id)) return socket.emit("error", "valid data");
            if(!valid.bool(accept)) return socket.emit("error", "valid data");
            
            await global.db.data.removeOne("friendRequests", { from: id, to: socket.user._id });

            const friendExists = await global.db.dataGraph.find("friends", { a: socket.user._id, b: id });
            if(friendExists.length > 0) return socket.emit("error", "friend already exists");

            if(accept) await global.db.dataGraph.add("friends", id, socket.user._id);

            global.sendToSocket(id, "requestFriendResponse", socket.user._id, accept);
        }catch(e){
            socket.logError(e);
        }
    });

    socket.ontimeout("removeFriend", 1_000, async (id) => {
        try{
            if(!socket.user) return socket.emit("error", "not auth");
            if(!valid.id(id)) return socket.emit("error", "valid data");

            const friendExists = await global.db.dataGraph.find("friends", socket.user._id, id);
            if(friendExists.length == 0) return socket.emit("error", "friend does not exist");

            await global.db.dataGraph.remove("friends", socket.user._id, id);
        }catch(e){
            socket.logError(e);
        }
    });

    socket.ontimeout("getFriends", 1_000, async () => {
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

            socket.emit("getFriends", friendsStatus);
        }catch(e){
            socket.logError(e);
        }
    });

    socket.ontimeout("getFriendRequests", 1_000, async () => {
        try{
            if(!socket.user) return socket.emit("error", "not auth");

            const friendRequestsData = await global.db.data.find("friendRequests", { to: socket.user._id });
            const friendRequests = friendRequestsData.map(f => f.from);

            socket.emit("getFriendRequests", friendRequests);
        }catch(e){
            socket.logError(e);
        }
    });
}