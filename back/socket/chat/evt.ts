import { rm } from "fs";
import { rmCache as statusMgmtRmCache } from "../../logic/status";
import db from "../../dataBase";
import { Id } from "../../types/base";
import { Socket } from "socket.io";

export default (socket: Socket) => {
    const uid = socket.user._id;
    socket.on("disconnect", () => {
        const sockets = global.getSocket(uid);
        if (sockets.length > 0) return;

        rm(`userFiles/${uid}`, { recursive: true, force: true }, (err) => {
            if (err) console.log(err);
        });
        statusMgmtRmCache(uid);

        updateFriendList(uid);
    });

    socket.on("logout", async (cb?: Function) => {
        const token = socket.handshake.auth.token;
        db.data.removeOne("token", { token });
        db.data.removeOne("fireToken", { fc: token });
        socket.user = null;
        if (cb) cb();
        setTimeout(() => {
            if (socket.connected) socket.disconnect();
        }, 100);
    });

    if (global.getSocket(uid).length == 1) updateFriendList(uid);
}

async function updateFriendList(id: Id) {
    const friendsGraph = await db.dataGraph.find("friends", id);
    const friends = friendsGraph.map(f => {
        if (f.a == id) return f.b;
        return f.a;
    });

    friends.forEach(f => {
        global.sendToSocket(f, "refreshData", "friend.get.all");
    });
}