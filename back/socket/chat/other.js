const valid = require("../../logic/validData");
const ogs = require("open-graph-scraper");

module.exports = (socket) => {
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
}