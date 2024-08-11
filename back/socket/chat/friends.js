module.exports = (socket) => {
    socket.ontimeout("requestFriend", 1_000, async (id) => {
        try{
            if(!socket.user) return socket.emit("error", "not auth");
            if(!valid.id(id)) return socket.emit("error", "valid data");

            const userExists = await global.db.data.findOne("users", { _id: id });
            if(!userExists) return socket.emit("error", "user does not exist");

            const friendExists = await global.db.dataGraph.find("friends", { a: socket.user._id, b: id });
            if(friendExists.length > 0) return socket.emit("error", "friend already exists");

            const friendRequestToExists = await global.db.dataGraph.find("friendRequests", { from: id, to: socket.user._id });
            if(friendRequestToExists.length > 0) return socket.emit("error", "friend request already exists");

            const friendRequestFromExists = await global.db.dataGraph.find("friendRequests", { from: socket.user._id, to: id });
            if(friendRequestFromExists.length > 0) return socket.emit("error", "friend request already exists");

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

            if(accept) await global.db.dataGraph.add("friends", { a: id, b: socket.user._id });

            global.sendToSocket(id, "requestFriendResponse", socket.user._id, accept);
        }catch(e){
            socket.logError(e);
        }
    });

    socket.ontimeout("rmFriend", 1_000, async (id) => {
        try{
            if(!socket.user) return socket.emit("error", "not auth");
            if(!valid.id(id)) return socket.emit("error", "valid data");

            const friendExists = await global.db.dataGraph.find("friends", { a: socket.user._id, b: id });
            if(friendExists.length == 0) return socket.emit("error", "friend does not exist");

            await global.db.dataGraph.rmNode("friends", socket.user._id, id);
        }catch(e){
            socket.logError(e);
        }
    });

    socket.ontimeout("getFriends", 1_000, async () => {
        try{
            if(!socket.user) return socket.emit("error", "not auth");
            const friends = await global.db.dataGraph.find("friends", { a: socket.user._id });
            socket.emit("getFriends", friends);
        }catch(e){
            socket.logError(e);
        }
    });

    socket.ontimeout("getFriendRequests", 1_000, async () => {
        try{
            if(!socket.user) return socket.emit("error", "not auth");
            const friendRequests = await global.db.dataGraph.find("friendRequests", { to: socket.user._id });
            socket.emit("getFriendRequests", friendRequests);
        }catch(e){
            socket.logError(e);
        }
    });
}