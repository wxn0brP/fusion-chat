import { 
    server_settings_get,
    server_settings_set,
} from "../chat/logic/serversSettings.js";

export default (socket) => {
    socket.ontimeout("server.settings.get", 5_000, async (id, sections, cb) => {
        try{
            if(typeof sections == "function" && !cb){
                cb = sections;
                sections = [];
            }
            const { err, res } = await server_settings_get(socket.user, id, sections);
            if(err) return socket.emit(...err);
            if(cb) cb(res, id);
            else socket.emit("server.settings.get", res, id);
        }catch(e){
            socket.logError(e);
        }
    });

    socket.ontimeout("server.settings.set", 5_000, async (id, data) => {
        try{
            const { err } = await server_settings_set(socket.user, id, data);
            if(err) return socket.emit(...err);
        }catch(e){
            socket.logError(e);
        }
    });
}