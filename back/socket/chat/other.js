import valid from "../../logic/validData.js";
import ogs from "open-graph-scraper";
import ogsToEmbed from "../../logic/ogToEmbed.js";
import sendMessage from "../../logic/sendMessage.js";

export default (socket) => {
    socket.ontimeout("get.ogs", 1_000, async (link, cb) => {
        try{
            if(!socket.user) return socket.emit("error", "not auth");
            if(!valid.str(link, 0, 300)) return socket.emit("error.valid", "get.ogs", "link");
            if(!/^https?:\/\//.test(link)) return socket.emit("error.valid", "get.ogs", "link");
            if(typeof cb !== "function") return socket.emit("error.valid", "get.ogs", "cb");

            try{
                const { error, result } = await ogs({ url: link });
                if(error) return cb(null);
                cb(result);
            }catch(e){
                socket.logError(`OGS fetching error: ${e.message}`);
                cb(null);
            }
        }catch(e){
            socket.logError(e);
        }
    });

    socket.ontimeout("send.embed.og", 1_000, async (to, chnl, link) => {
        try{
            if(!socket.user) return socket.emit("error", "not auth");
            if(!valid.id(to)) return socket.emit("error.valid", "send.embed.og", "to");
            if(!valid.idOrSpecyficStr(chnl, ["main"])) return socket.emit("error.valid", "send.embed.og", "chnl");
            if(!valid.str(link, 0, 300)) return socket.emit("error.valid", "send.embed.og", "link");
            if(!/^https?:\/\//.test(link)) return socket.emit("error.valid", "send.embed.og", "link");

            const embed = await ogsToEmbed(link);
            if(!embed) return socket.emit("error", "ogToEmbed error");
            
            const result = await sendMessage(
                {
                    to, chnl, msg: "Embed",
                },
                socket.user,
                {
                    customFields: {
                        embed: embed
                    }
                }
            );
            if(result.err) socket.emit(...result.err);
        }catch(e){
            socket.logError(e);
        }
    });
}