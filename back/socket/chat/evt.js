import { rm } from "fs";
import { rmCache as statusMgmtRmCache } from "../../logic/status.js";

export default (socket) => {
    socket.on("disconnect", () => {
        const uid = socket.user._id;
        const sockets = global.getSocket(socket.user._id);
        if(sockets.length > 0) return;

        rm(`userFiles/${socket.user._id}`, { recursive: true, force: true }, (err) => {
            if(err) console.log(err);
        });
        statusMgmtRmCache(uid);
    });
}