import hub from "../../hub";
import socket from "../socket/socket";
hub("mess/socket");

import {
    mess,
    message_fetch,
    message_delete,
    messages_delete,
    message_edit,
    message_react,
    message_search,
    realm_thread_delete,
} from "../socket/logic/mess";
import { message_mark_read } from "../socket/logic/evt";
import vars from "../../var/var";
import { Core_mess__dbMessage } from "../../types/core/mess";
import messageCacheController from "../cacheControllers/mess";

socket.on("mess", mess);
socket.on("message.fetch", message_fetch);
socket.on("message.fetch", (data: Core_mess__dbMessage[]) => {
    messageCacheController.addMessages(vars.chat.to, vars.chat.chnl, data);
});
socket.on("message.delete", message_delete);
socket.on("messages.delete", messages_delete);
socket.on("message.edit", message_edit);
socket.on("message.react", message_react);
socket.on("message.search", message_search);
socket.on("realm.thread.delete", realm_thread_delete);
socket.on("message.mark.read", message_mark_read);