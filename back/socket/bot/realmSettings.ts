import { Socket_StandardRes_Error } from "../../types/socket/res";
import { 
    realm_settings_get,
    realm_settings_set,
} from "../chat/logic/realmSettings";

export default (socket) => {
    socket.onLimit("realm.settings.get", 5_000, async (id, sections, cb) => {
        try{
            if(typeof sections == "function" && !cb){
                cb = sections;
                sections = [];
            }
            const { err, res } = await realm_settings_get(socket.user, id, sections);
            if(err) return socket.emit(...err as Socket_StandardRes_Error[]);
            if(cb) cb(res, id);
            else socket.emit("realm.settings.get", res, id);
        }catch(e){
            socket.logError(e);
        }
    });

    socket.onLimit("realm.settings.set", 5_000, async (id, data) => {
        try{
            const { err } = await realm_settings_set(socket.user, id, data);
            if(err) return socket.emit(...err as Socket_StandardRes_Error[]);
        }catch(e){
            socket.logError(e);
        }
    });
}