import { Core_mess__dbMessage } from "../../types/core/mess";
import Id from "../../types/Id";
import utils from "../../utils/utils";
import vars from "../../var/var";
import { message_fetch } from "../socket/logic/mess";
import { openDB, IDBPDatabase } from "idb";

const DB_NAME = "messages";
let database: IDBPDatabase | null = null;

/**
 * Opens a database with the current timestamp as the version.
 */
export async function getDB(upgrade?: (db: IDBPDatabase) => void): Promise<IDBPDatabase> {
    if (!upgrade && database) return database;

    const version = Date.now(); // UNIX timestamp
    const newDB = await openDB(DB_NAME, version, {
        upgrade(upgraded) {
            if (upgrade) upgrade(upgraded);
        },
    });

    database = newDB;
    return newDB;
}

/**
 * Creates a collection if it doesn't exist.
 */
export async function createCollection(collection: string): Promise<IDBPDatabase> {
    let db = await getDB();

    if (!db.objectStoreNames.contains(collection)) {
        db.close(); // Zamykamy przed migracją
        db = await getDB((upgraded) => {
            const store = upgraded.createObjectStore(collection, { keyPath: "_id" });
            store.createIndex("chnl", "chnl", { unique: false });
        });
    }

    return db;
}

interface idb_message extends Core_mess__dbMessage {
    chnl: Id;
}

class MessageCacheController {
    constructor() {
        getDB();
    }

    async addMessage(chat: Id, chnl: Id, message: Core_mess__dbMessage) {
        const msg: idb_message = {
            ...message,
            chnl
        }
        const db = await createCollection(chat);
        await db.put(chat, msg);
        await enforceChannelCacheLimit(db, chat, chnl);
    }

    async addMessages(chat: Id, chnl: Id, messages: Core_mess__dbMessage[]) {
        if (messages.length === 0) return;

        const db = await createCollection(chat);
        const tx = db.transaction(chat, "readwrite");
        const store = tx.objectStore(chat);

        for (const message of messages) {
            const msg: idb_message = { ...message, chnl };
            await store.put(msg);
            // TODO message cache
            /**
             * 1. make gen id more precise
             * 2. remove await
             */
        }

        await tx.done;
        await enforceChannelCacheLimit(db, chat, chnl);
    }

    async getMessagesRaw(chat: Id, chnl: Id) {
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

    async deleteMessage(chat: Id, id: Id) {
        const db = await createCollection(chat);
        const store = db.transaction(chat, "readwrite").objectStore(chat);
        await store.delete(id);
    }

    async deleteMessages(chat: Id, ids: Id[]) {
        const db = await createCollection(chat);
        const tx = db.transaction(chat, "readwrite");
        const store = tx.objectStore(chat);
        for (const id of ids) {
            store.delete(id);
        }
        await tx.done;
    }

    async editMessage(id: Id, msg: string, time: string, chatId: Id) {
        const db = await createCollection(chatId);
        const tx = db.transaction(chatId, "readwrite");
        const store = tx.objectStore(chatId);

        const existingMessage = await store.get(id);
        if (!existingMessage) return;

        const updatedMessage: idb_message = {
            ...existingMessage,
            msg,
            lastEdit: time
        }

        await store.put(updatedMessage);
        await tx.done;
    }
}

async function enforceChannelCacheLimit(db: IDBPDatabase, chat: Id, chnl: Id) {
    const tx = db.transaction(chat, "readwrite");
    const store = tx.objectStore(chat);
    const index = store.index("chnl");

    // TODO add message limit to settings
    const messages = await index.getAll(chnl);
    if (messages.length <= 150) return;

    messages.sort((a, b) => utils.extractTimeFromId(b._id) - utils.extractTimeFromId(a._id));

    const excess = messages.length - 150;
    for (let i = 0; i < excess; i++) {
        await store.delete(messages[i]._id);
    }

    await tx.done;
}


const messageCacheController = new MessageCacheController();
export default messageCacheController;