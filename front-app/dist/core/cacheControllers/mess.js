import utils from "../../utils/utils.js";
import vars from "../../var/var.js";
import { message_fetch } from "../socket/logic/mess.js";
import { openDB } from "idb";
const DB_NAME = "messages";
let database = null;
export async function getDB(upgrade) {
    if (!upgrade && database)
        return database;
    const version = Date.now();
    const newDB = await openDB(DB_NAME, version, {
        upgrade(upgraded) {
            if (upgrade)
                upgrade(upgraded);
        },
    });
    database = newDB;
    return newDB;
}
export async function createCollection(collection) {
    let db = await getDB();
    if (!db.objectStoreNames.contains(collection)) {
        db.close();
        db = await getDB((upgraded) => {
            const store = upgraded.createObjectStore(collection, { keyPath: "_id" });
            store.createIndex("chnl", "chnl", { unique: false });
        });
    }
    return db;
}
class MessageCacheController {
    constructor() {
        getDB();
    }
    async addMessage(chat, chnl, message) {
        const msg = {
            ...message,
            chnl
        };
        const db = await createCollection(chat);
        await db.put(chat, msg);
        await enforceChannelCacheLimit(db, chat, chnl);
    }
    async addMessages(chat, chnl, messages) {
        if (messages.length === 0)
            return;
        const db = await createCollection(chat);
        const tx = db.transaction(chat, "readwrite");
        const store = tx.objectStore(chat);
        for (const message of messages) {
            const msg = { ...message, chnl };
            await store.put(msg);
        }
        await tx.done;
        await enforceChannelCacheLimit(db, chat, chnl);
    }
    async getMessagesRaw(chat, chnl) {
        const db = await createCollection(chat);
        const tx = db.transaction(chat, "readonly");
        const store = tx.objectStore(chat);
        const index = store.index("chnl");
        const data = await index.getAll(chnl);
        return data;
    }
    async getMessages() {
        const { to, chnl } = vars.chat;
        const data = await this.getMessagesRaw(to, chnl);
        vars.chat.actMess = data.length;
        data.reverse();
        message_fetch(data);
    }
    async deleteMessage(chat, id) {
        const db = await createCollection(chat);
        const store = db.transaction(chat, "readwrite").objectStore(chat);
        await store.delete(id);
    }
    async deleteMessages(chat, ids) {
        const db = await createCollection(chat);
        const tx = db.transaction(chat, "readwrite");
        const store = tx.objectStore(chat);
        for (const id of ids) {
            store.delete(id);
        }
        await tx.done;
    }
    async editMessage(id, msg, time, chatId) {
        const db = await createCollection(chatId);
        const tx = db.transaction(chatId, "readwrite");
        const store = tx.objectStore(chatId);
        const existingMessage = await store.get(id);
        if (!existingMessage)
            return;
        const updatedMessage = {
            ...existingMessage,
            msg,
            lastEdit: time
        };
        await store.put(updatedMessage);
        await tx.done;
    }
}
async function enforceChannelCacheLimit(db, chat, chnl) {
    const tx = db.transaction(chat, "readwrite");
    const store = tx.objectStore(chat);
    const index = store.index("chnl");
    const messages = await index.getAll(chnl);
    if (messages.length <= 150)
        return;
    messages.sort((a, b) => utils.extractTimeFromId(b._id) - utils.extractTimeFromId(a._id));
    const excess = messages.length - 150;
    for (let i = 0; i < excess; i++) {
        await store.delete(messages[i]._id);
    }
    await tx.done;
}
const messageCacheController = new MessageCacheController();
export default messageCacheController;
//# sourceMappingURL=mess.js.map