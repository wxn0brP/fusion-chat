import { Socket } from "socket.io";
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

export default (socket: Socket) => {
    socket.onLimit("friend.request", 1_000, async (nameOrId: string) => {
        try {
            const data = await friend_request(socket.user, nameOrId);
            socket.processSocketError(data);
        } catch (e) {
            socket.logError(e);
        }
    });

    socket.onLimit("friend.response", 1_000, async (id: Id, accept: boolean) => {
        try {
            const data = await friend_response(socket.user, id, accept);
            socket.processSocketError(data);
        } catch (e) {
            socket.logError(e);
        }
    });

    socket.onLimit("friend.request.remove", 1_000, async (id: Id) => {
        try {
            const data = await friend_request_remove(socket.user, id);
            socket.processSocketError(data);
        } catch (e) {
            socket.logError(e);
        }
    });

    socket.onLimit("friend.remove", 1_000, async (id: Id) => {
        try {
            const data = await friend_remove(socket.user, id);
            socket.processSocketError(data);
        } catch (e) {
            socket.logError(e);
        }
    });

    socket.onLimit("friend.get.all", 1_000, async (cb?: Function) => {
        try {
            const data = await friend_get_all(socket.user);
            if (socket.processSocketError(data)) return;
            if (cb) cb(data.res);
            else socket.emit("friend.get.all", data.res);
        } catch (e) {
            socket.logError(e);
        }
    });

    socket.onLimit("friend.requests.get", 1_000, async (cb?: Function) => {
        try {
            const data = await friend_requests_get(socket.user);
            if (socket.processSocketError(data)) return;
            if (cb) cb(data.res);
            else socket.emit("friend.requests.get", data.res);
        } catch (e) {
            socket.logError(e);
        }
    });

    socket.onLimit("user.profile", 1000, async (id: Id, cb?: Function) => {
        try {
            const data = await user_profile(socket.user, id);
            if (socket.processSocketError(data)) return;
            if (cb) cb(data.res);
            else socket.emit("user.profile", data.res);
        } catch (e) {
            socket.logError(e);
        }
    });
}