import sendMessage from "../../logic/sendMessage.js";
import { Id } from "../../types/base.js";
import { Request } from "../../types/sendMessage.js";
import Socket__Mess from "../../types/socket/chat/mess.js";
import { Socket_StandardRes_Error } from "../../types/socket/res.js";
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
} from "./logic/mess.js";

export default (socket) => {
    socket.onLimit("mess", 200, async (req: Request) => {
        try {
            const { err } = await sendMessage(req, socket.user);
            if (err) return socket.emit(...err as Socket_StandardRes_Error[]);
        } catch (e) {
            socket.logError(e);
        }
    });

    socket.onLimit("message.edit", 1000, async (chatId: Id, _id: Id, msg: string) => {
        try {
            const { err } = await message_edit(socket.user, chatId, _id, msg);
            if (err) return socket.emit(...err as Socket_StandardRes_Error[]);
        } catch (e) {
            socket.logError(e);
        }
    });

    socket.onLimit("message.delete", 1000, async (chatId: Id, _id: Id) => {
        try {
            const { err } = await message_delete(socket.user, chatId, _id);
            if (err) return socket.emit(...err as Socket_StandardRes_Error[]);
        } catch (e) {
            socket.logError(e);
        }
    });

    socket.onLimit("messages.delete", 1000, async (chatId: Id, ids: Id[]) => {
        try {
            const { err } = await messages_delete(socket.user, chatId, ids);
            if (err) return socket.emit(...err as Socket_StandardRes_Error[]);
        } catch (e) {
            socket.logError(e);
        }
    });

    socket.onLimit("message.fetch", 300, async (chatId: Id, chnl: Id, start: number, end: number, cb?: Function) => {
        try {
            const { err, res } = await message_fetch(socket.user, chatId, chnl, start, end);
            if (err) return socket.emit(...err as Socket_StandardRes_Error[]);
            if (cb) cb(res);
            else socket.emit("message.fetch", res);
        } catch (e) {
            socket.logError(e);
        }
    });

    socket.onLimit("message.fetch.id", 300, async (chatId: Id, chnl: Id, _id: Id, cb?: Function) => {
        try {
            const { err, res } = await message_fetch_id(socket.user, chatId, chnl, _id);
            if (err) return socket.emit(...err as Socket_StandardRes_Error[]);
            if (cb) cb(res);
            else socket.emit("message.fetch.id", res);
        } catch (e) {
            socket.logError(e);
        }
    });

    socket.onLimit("message.mark.read", 100, async (chatId: Id, chnl: Id, mess_id: Id, cb?: Function) => {
        try {
            const { err, res } = await message_mark_read(socket.user, chatId, chnl, mess_id);
            if (err) return socket.emit(...err as Socket_StandardRes_Error[]);
            if (!res) return;
            if (cb) cb(chatId, chnl, res);
            else socket.emit("message.mark.read", chatId, chnl, res);
        } catch (e) {
            socket.logError(e);
        }
    });

    socket.onLimit("message.react", 100, async (chatId: Id, msgId: Id, react: string) => {
        try {
            const { err } = await message_react(socket.user, chatId, msgId, react);
            if (err) return socket.emit(...err as Socket_StandardRes_Error[]);
        } catch (e) {
            socket.logError(e);
        }
    });

    socket.onLimit("message.search", 1000, async (chatId: Id, chnl: Id, query: Socket__Mess.MessageQuery, cb?: Function) => {
        try {
            const { err, res } = await message_search(socket.user, chatId, chnl, query);
            if (err) return socket.emit(...err as Socket_StandardRes_Error[]);
            if (cb) cb(res);
            else socket.emit("message.search", res);
        } catch (e) {
            socket.logError(e);
        }
    });

    socket.onLimit("message.pin", 1000, async (chatId: Id, chnl: Id, msg_id: Id, pin: boolean) => {
        try {
            const { err } = await message_pin(socket.user, chatId, chnl, msg_id, pin);
            if (err) return socket.emit(...err as Socket_StandardRes_Error[]);
        } catch (e) {
            socket.logError(e);
        }
    });

    socket.onLimit("message.fetch.pinned", 1000, async (chatId: Id, chnl: Id, cb?: Function) => {
        try {
            const { err, res } = await message_fetch_pinned(socket.user, chatId, chnl);
            if (err) return socket.emit(...err as Socket_StandardRes_Error[]);
            if (cb) cb(res);
            else socket.emit("message.fetch.pinned", res);
        } catch (e) {
            socket.logError(e);
        }
    });
}