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
    message_fetch_pinned,
    realm_thread_list,
    realm_thread_delete,
} from "../socket/logic/mess";
import { message_mark_read } from "../socket/logic/evt";

socket.on("mess", mess);
socket.on("message.fetch", message_fetch);
socket.on("message.delete", message_delete);
socket.on("messages.delete", messages_delete);
socket.on("message.edit", message_edit);
socket.on("message.react", message_react);
socket.on("message.search", message_search);
socket.on("message.fetch.pinned", message_fetch_pinned);
socket.on("realm.thread.list", realm_thread_list);
socket.on("realm.thread.delete", realm_thread_delete);
socket.on("message.mark.read", message_mark_read);