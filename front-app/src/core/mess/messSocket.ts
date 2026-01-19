
import { socket } from "../socket/socket"; import {
    sck_mess,
    sck_message_fetch,
    sck_message_delete,
    sck_messages_delete,
    sck_message_edit,
    sck_message_react,
    sck_message_search,
    sck_realm_thread_delete,
} from "../socket/logic/mess";
import { sck_message_mark_read } from "../socket/logic/evt";
import { vars } from "#var/var";
import { Core_mess__dbMessage } from "#types/core/mess";
import { messageCacheController } from "../cacheControllers/mess";

socket.on("mess", sck_mess);
socket.on("message.fetch", sck_message_fetch);
socket.on("message.fetch", (data: Core_mess__dbMessage[]) => {
    messageCacheController.addMessages(vars.chat.to, vars.chat.chnl, data);
});
socket.on("message.delete", sck_message_delete);
socket.on("messages.delete", sck_messages_delete);
socket.on("message.edit", sck_message_edit);
socket.on("message.react", sck_message_react);
socket.on("message.search", sck_message_search);
socket.on("realm.thread.delete", sck_realm_thread_delete);
socket.on("message.mark.read", sck_message_mark_read);