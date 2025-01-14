import { rm } from "fs";
import { rmCache as statusMgmtRmCache } from "../../logic/status.js";
import db from "../../dataBase.js";

export default (socket) => {
    const uid = socket.user._id;
    socket.on("disconnect", () => {
        const sockets = global.getSocket(uid);
        if(sockets.length > 0) return;

        rm(`userFiles/${uid}`, { recursive: true, force: true }, (err) => {
            if(err) console.log(err);
        });
        statusMgmtRmCache(uid);

        updateFriendList(uid);
    });

    if(global.getSocket(uid).length == 1) updateFriendList(uid);
}

async function updateFriendList(id){
    const friendsGraph = await db.dataGraph.find("friends", id);
    const friends = friendsGraph.map(f => {
        if(f.a == id) return f.b;
        return f.a;
    });

    friends.forEach(f => {
        global.sendToSocket(f, "refreshData", "friend.get.all");
    });
}