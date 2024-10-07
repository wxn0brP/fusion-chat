import {
    get_ogs,
    send_embed_og,
    send_embed_data,
} from "./logic/other.js";

export default (socket) => {
    socket.ontimeout("get.ogs", 1_000, async (link, cb) => {
        try{
            const { err, res } = await get_ogs(link);
            if(err) return socket.emit(...err);
            if(cb) cb(res);
            else socket.emit("get.ogs", res);
        }catch(e){
            socket.logError(e);
        }
    });

    socket.ontimeout("send.embed.og", 1_000, async (to, chnl, link) => {
        try{
            const { err } = await send_embed_og(socket.user, to, chnl, link);
            if(err) return socket.emit(...err);
        }catch(e){
            socket.logError(e);
        }
    });

    socket.ontimeout("send.embed.data", 1_000, async (to, chnl, embed) => {
        try{
            const { err } = await send_embed_data(socket.user, to, chnl, embed);
            if(err) return socket.emit(...err);
        }catch(e){
            socket.logError(e);
        }
    });
}