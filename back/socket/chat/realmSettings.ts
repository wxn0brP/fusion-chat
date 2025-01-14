import { Socket } from "socket.io";
import { Socket_StandardRes_Error } from "../../types/socket/res.js";
import {
    realm_settings_get,
    realm_settings_set,
} from "./logic/realmSettings.js";

export default (socket: Socket) => {
    socket.onLimit("realm.settings.get", 5_000, async (id, sections, cb) => {
        try {
            if (typeof sections == "function" && !cb) {
                cb = sections;
                sections = [];
            }
            const data = await realm_settings_get(socket.user, id, sections);
            if (socket.processSocketError(data)) return;
            if (cb) cb(data.res, id);
            else socket.emit("realm.settings.get", data.res, id);
        } catch (e) {
            socket.logError(e);
        }
    });

    socket.onLimit("realm.settings.set", 5_000, async (id, data, cb) => {
        try {
            const event_data = await realm_settings_set(socket.user, id, data);
            if (cb) {
                if (!event_data.err) return cb(false);
                return cb(...event_data.err);
            }
            socket.processSocketError(event_data);
        } catch (e) {
            socket.logError(e);
        }
    });
}