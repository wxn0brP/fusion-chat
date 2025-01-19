import { Socket } from "socket.io";
import sendMessage from "../../logic/sendMessage";
import { Id } from "../../types/base";
import { Request } from "../../types/sendMessage";
import Socket__Mess from "../../types/socket/chat/mess";
import {
    message_delete,
    messages_delete,
    message_edit,
    message_fetch,
    message_fetch_pinned,
    message_mark_read,
    message_pin,
    message_react,
    message_search,
    message_fetch_id,
} from "./logic/mess";

export default (socket: Socket) => {
    socket.onLimit("mess", 200, async (req: Request) => {
        try {
            const data = await sendMessage(req, socket.user);
            socket.processSocketError(data);
        } catch (e) {
            socket.logError(e);
        }
    });

    socket.onLimit("message.edit", 1000, async (chatId: Id, _id: Id, msg: string) => {
        try {
            const data = await message_edit(socket.user, chatId, _id, msg);
            socket.processSocketError(data);
        } catch (e) {
            socket.logError(e);
        }
    });

    socket.onLimit("message.delete", 1000, async (chatId: Id, _id: Id) => {
        try {
            const data = await message_delete(socket.user, chatId, _id);
            socket.processSocketError(data);
        } catch (e) {
            socket.logError(e);
        }
    });

    socket.onLimit("messages.delete", 1000, async (chatId: Id, ids: Id[]) => {
        try {
            const data = await messages_delete(socket.user, chatId, ids);
            socket.processSocketError(data);
        } catch (e) {
            socket.logError(e);
        }
    });

    socket.onLimit("message.fetch", 300, async (chatId: Id, chnl: Id, start: number, end: number, cb?: Function) => {
        try {
            const data = await message_fetch(socket.user, chatId, chnl, start, end);
            if (socket.processSocketError(data)) return;
            if (cb) cb(data.res);
            else socket.emit("message.fetch", data.res);
        } catch (e) {
            socket.logError(e);
        }
    });

    socket.onLimit("message.fetch.id", 300, async (chatId: Id, chnl: Id, _id: Id, cb?: Function) => {
        try {
            const data = await message_fetch_id(socket.user, chatId, chnl, _id);
            if (socket.processSocketError(data)) return;
            if (cb) cb(data.res);
            else socket.emit("message.fetch.id", data.res);
        } catch (e) {
            socket.logError(e);
        }
    });

    socket.onLimit("message.mark.read", 100, async (chatId: Id, chnl: Id, mess_id: Id, cb?: Function) => {
        try {
            const data = await message_mark_read(socket.user, chatId, chnl, mess_id);
            if (socket.processSocketError(data)) return;
            const res = data.res;
            if (!res) return;
            if (cb) cb(chatId, chnl, res);
            else socket.emit("message.mark.read", chatId, chnl, res);
        } catch (e) {
            socket.logError(e);
        }
    });

    socket.onLimit("message.react", 100, async (chatId: Id, msgId: Id, react: string) => {
        try {
            const data = await message_react(socket.user, chatId, msgId, react);
            socket.processSocketError(data);
        } catch (e) {
            socket.logError(e);
        }
    });

    socket.onLimit("message.search", 1000, async (chatId: Id, chnl: Id, query: Socket__Mess.MessageQuery, cb?: Function) => {
        try {
            const data = await message_search(socket.user, chatId, chnl, query);
            if (socket.processSocketError(data)) return;
            if (cb) cb(data.res);
            else socket.emit("message.search", data.res);
        } catch (e) {
            socket.logError(e);
        }
    });

    socket.onLimit("message.pin", 1000, async (chatId: Id, chnl: Id, msg_id: Id, pin: boolean) => {
        try {
            const data = await message_pin(socket.user, chatId, chnl, msg_id, pin);
            if (socket.processSocketError(data)) return;
        } catch (e) {
            socket.logError(e);
        }
    });

    socket.onLimit("message.fetch.pinned", 1000, async (chatId: Id, chnl: Id, cb?: Function) => {
        try {
            const data = await message_fetch_pinned(socket.user, chatId, chnl);
            if (socket.processSocketError(data)) return;
            if (cb) cb(data.res);
            else socket.emit("message.fetch.pinned", data.res);
        } catch (e) {
            socket.logError(e);
        }
    });
}