import {
    get_ogs,
    send_embed_og,
    send_embed_data,
    fireToken_get
} from "./logic/other.js";

export default (socket) => {
    socket.onLimit("get.ogs", 1_000, async (link, cb) => {
        try{
            const { err, res } = await get_ogs(link);
            if(err) return socket.emit(...err);
            if(cb) cb(res);
            else socket.emit("get.ogs", res);
        }catch(e){
            socket.logError(e);
        }
    });

    socket.onLimit("send.embed.og", 1_000, async (to, chnl, link) => {
        try{
            const { err } = await send_embed_og(socket.user, to, chnl, link);
            if(err) return socket.emit(...err);
        }catch(e){
            socket.logError(e);
        }
    });

    socket.onLimit("send.embed.data", 1_000, async (to, chnl, embed) => {
        try{
            const { err } = await send_embed_data(socket.user, to, chnl, embed);
            if(err) return socket.emit(...err);
        }catch(e){
            socket.logError(e);
        }
    });

    socket.onLimit("fireToken.get", 1_000, async (cb) => {
        try{
            const res = await fireToken_get(socket.user, socket.handshake.auth.token);
            if(cb) cb(res);
            else socket.emit("fireToken.get", res);
        }catch(e){
            socket.logError(e);
        }
    });

    socket.on("logout", async (cb) => {
        const token = socket.handshake.auth.token;
        global.db.data.removeOne("token", { token });
        global.db.data.removeOne("fireToken", { fc: token });
        socket.user = null;
        if(cb) cb();
        setTimeout(() => {
            if(socket.connected) socket.disconnect();
        }, 100);
    });
}