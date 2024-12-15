import { rm } from "fs";
import { rmCache as statusMgmtRmCache } from "../../logic/status.js";

export default (socket) => {
    const uid = socket.user._id;
    socket.on("disconnect", () => {
        const sockets = global.getSocket(uid);
        if(sockets.length > 0) return;

        rm(`userFiles/${uid}`, { recursive: true, force: true }, (err) => {
            if(err) console.log(err);
        });
        statusMgmtRmCache(uid);
    });
}