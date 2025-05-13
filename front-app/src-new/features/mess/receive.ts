import messagesView from "#components/app/messages.view";
import { $store } from "#store";
import { Core_mess__dbMessage, Core_mess__receivedMessage } from "#types/core/mess";
import messageCacheController from "#infra/cache/mess";

export function messReceived(data: Core_mess__receivedMessage) {
    const message = convertReceivedMessageToDbMessage(data);
    messageCacheController.addMessage(data.to, data.chnl, message);

    if (data.to !== $store.chat.id.get() || data.chnl !== $store.chat.chnl.get()) return;
    messagesView.append(message, { up: false, scroll: true });
}

function convertReceivedMessageToDbMessage(data: Core_mess__receivedMessage): Core_mess__dbMessage {
    const mess: Core_mess__dbMessage = {
        _id: data._id,
        fr: data.fr,
        msg: data.msg,
    }

    if (data.embed) mess.embed = data.embed;
    if (data.res) mess.res = data.res;

    return mess;
}