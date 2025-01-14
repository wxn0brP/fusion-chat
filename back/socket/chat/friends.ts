import { Socket } from "socket.io";
import { Socket_StandardRes, Socket_StandardRes_Error } from "../../types/socket/res.js";
import {
    friend_get_all,
    friend_requests_get,
    friend_remove,
    friend_request,
    friend_response,
    friend_request_remove,
    user_profile
} from "./logic/friends.js"
import { Id } from "../../types/base.js";

export default (socket) => {
    socket.onLimit("friend.request", 1_000, async (nameOrId: string) => {
        try {
            const { err } = await friend_request(socket.user, nameOrId);
            if (err) return socket.emit(...err as Socket_StandardRes_Error[]);
        } catch (e) {
            socket.logError(e);
        }
    });

    socket.onLimit("friend.response", 1_000, async (id: Id, accept: boolean) => {
        try {
            const { err } = await friend_response(socket.user, id, accept);
            if (err) return socket.emit(...err as Socket_StandardRes_Error[]);
        } catch (e) {
            socket.logError(e);
        }
    });

    socket.onLimit("friend.request.remove", 1_000, async (id: Id) => {
        try {
            const { err } = await friend_request_remove(socket.user, id);
            if (err) return socket.emit(...err as Socket_StandardRes_Error[]);
        } catch (e) {
            socket.logError(e);
        }
    });

    socket.onLimit("friend.remove", 1_000, async (id: Id) => {
        try {
            const { err } = await friend_remove(socket.user, id);
            if (err) return socket.emit(...err as Socket_StandardRes_Error[]);
        } catch (e) {
            socket.logError(e);
        }
    });

    socket.onLimit("friend.get.all", 1_000, async (cb?: Function) => {
        try {
            const { err, res } = await friend_get_all(socket.user);
            if (err) return socket.emit(...err as Socket_StandardRes_Error[]);
            if (cb) cb(res);
            else socket.emit("friend.get.all", res);
        } catch (e) {
            socket.logError(e);
        }
    });

    socket.onLimit("friend.requests.get", 1_000, async (cb?: Function) => {
        try {
            const { err, res } = await friend_requests_get(socket.user);
            if (err) return socket.emit(...err as Socket_StandardRes_Error[]);
            if (cb) cb(res);
            else socket.emit("friend.requests.get", res);
        } catch (e) {
            socket.logError(e);
        }
    });

    socket.onLimit("user.profile", 1000, async (id: Id, cb?: Function) => {
        try {
            const { err, res } = await user_profile(socket.user, id);
            if (err) return socket.emit(...err as Socket_StandardRes_Error[]);
            if (cb) cb(res);
            else socket.emit("user.profile", res);
        } catch (e) {
            socket.logError(e);
        }
    });
}