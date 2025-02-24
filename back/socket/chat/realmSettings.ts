import { Socket } from "socket.io";
import {
    realm_settings_get,
    realm_settings_set,
    realm_webhook_token_get
} from "./logic/realmSettings";
import Id from "#id";

export default (socket: Socket) => {
    socket.onLimit("realm.settings.get", 5_000, async (id: Id, sections, cb: Function) => {
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

    socket.onLimit("realm.settings.set", 5_000, async (id: Id, data, cb: Function) => {
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

    socket.onLimit("realm.webhook.token.get", 5_000, async (realmId: Id, tokenId: Id, cb: Function) => {
        try {
            const data = await realm_webhook_token_get(socket.user, realmId, tokenId);
            if (socket.processSocketError(data)) return;
            if (cb) cb(data.res);
            else socket.emit("realm.webhook.token.get", data.res);
        } catch (e) {
            socket.logError(e);
        }
    });
}