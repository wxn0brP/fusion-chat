import barView from "#components/app/bar.view";
import messagesView from "#components/app/messages.view";
import realmInit from "#components/render/realmInit";
import socket from "#socket";
import { socketFetch } from "#socket/utils";
import { $store } from "#store";
import { Id } from "#types/base";
import { Core_mess__dbMessage } from "#types/core/mess";
import { Ui_render__category } from "#types/ui/render";
import { Vars_realm__role, Vars_realm__thread, Vars_realm__user } from "#types/var";
import messageCacheController from "#infra/cache/mess";
import { changeChatVisibly } from "#features/general-actions/chat";

export async function loadMessages(clear: boolean = false) {
    const chatId = $store.chat.id.get();
    const chnlId = $store.chat.chnl.get();
    const start = $store.chat.loadedMessages.get();
    const end = start + 100;

    let messages: Core_mess__dbMessage[] = [];
    if (socket.connected) {
        [messages] = await socketFetch<[Core_mess__dbMessage[]]>("message.fetch", chatId, chnlId, start, end);
    } else {
        const m = await messageCacheController.getMessagesRaw(chatId, chnlId);
        messages = m.slice(start, end);
    }
    $store.chat.loadedMessages.set(end);
    if(clear) {
        messagesView.clearMessages();
        messageCacheController.deleteAllMessages(chatId, chnlId).then(() => {
            messageCacheController.addMessages(chatId, chnlId, messages);
        });
    } else {
        messageCacheController.addMessages(chatId, chnlId, messages);
    }
    await renderMessages(messages);
}

async function renderMessages(messages: Core_mess__dbMessage[]) {
    for (const message of messages) {
        messagesView.append(message, {
            scroll: false,
            up: true
        });
    }
}

export async function changeToDmChat(id: Id) {
    $store.chat.chnl.set("main");
    $store.chat.id.set(id);
    $store.chat.loadedMessages.set(0);

    await loadMessages(true);
    messagesView.setScrollToBottom();
    changeChatVisibly(id);
    barView.focusInput();
}

export async function changeToChannel(id: Id) {
    $store.chat.chnl.set(id);
    $store.chat.loadedMessages.set(0);
    messagesView.clearMessages();

    await loadMessages();
    messagesView.setScrollToBottom();
    barView.focusInput();
}

export async function changeToRealm(id: Id) {
    const [name, categories, permission] = await socketFetch<[string, Ui_render__category[], number]>("realm.setup", id);
    await realmInit(id, name, categories);
    
    $store.chat.id.set(id);
    $store.realm.p.set(permission);

    socket.emit("realm.thread.list", id, null, (threads: Vars_realm__thread[]) => {
        $store.realm.threads.set(threads);
    });

    socket.emit("realm.users.sync", id, (users: Vars_realm__user[], roles: Vars_realm__role[]) => {
        $store.realm.users.set(users);
        $store.realm.roles.set(roles);
    });

    await changeToChannel($store.chat.chnl.get());
    changeChatVisibly(id);
}