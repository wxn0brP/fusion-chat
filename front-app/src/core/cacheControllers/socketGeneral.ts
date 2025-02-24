import socket from "../socket/socket";
import hub from "../../hub";
hub("cacheControllers/socketGeneral");

class SocketController {
    private evtName: string;
    private cb: (...args: any[]) => void;

    constructor(evtName: string, cb: (...args: any[]) => void) {
        socket.on(evtName, cb);
        this.evtName = evtName;
        this.cb = cb;
    }

    private async sendToSocket(key: string, resolve: () => void, ...data: any[]) {
        const customCb = typeof data[data.length - 1] === "function" ? data.pop() : null;
        socket.emit(this.evtName, ...data, async (...socketReturnData: any[]) => {
            await saveToDB({ id: key, data: [...socketReturnData] });
            if (customCb) customCb(...socketReturnData);
            else this.cb(...socketReturnData);
            resolve();
        });
    }

    async emitId(id: string="", ...data: any[]): Promise<void> {
        return new Promise(async (resolve) => {
            const key = this.evtName + (id ? "-" + id : "");
            if (socket.connected) {
                await this.sendToSocket(key, resolve, ...data);
            } else {
                const cachedData = await getFromDB(key);
                const customCb = typeof data[data.length - 1] === "function" ? data.pop() : null;
                if (cachedData) {
                    if (customCb) customCb(...cachedData.data);
                    else this.cb(...cachedData.data);
                    resolve();
                } else {
                    await this.sendToSocket(key, resolve, ...data);
                }
            }
        })
    }

    async emit(...data: any[]) {
        await this.emitId("", ...data);
    }

    async emitDataId(id: string, ...data: any[]) {
        await this.emitId(id, ...[id, ...data]);
    }
}

export default SocketController;

export function openDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open("socket", 1);

        request.onupgradeneeded = () => {
            const db = request.result;
            if (!db.objectStoreNames.contains("general")) {
                db.createObjectStore("general", { keyPath: "id" });
            }
        };

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

export function saveToDB(entry: { id: string; data: unknown[] }): Promise<void> {
    return new Promise(async (resolve, reject) => {
        const db = await openDB();
        const tx = db.transaction("general", "readwrite");
        const store = tx.objectStore("general");
        const putRequest = store.put(entry);

        putRequest.onsuccess = () => {
            db.close();
            resolve();
        };
        putRequest.onerror = () => reject(putRequest.error);
    });
}

export function getFromDB(id: string): Promise<{ id: string; data: unknown[] } | undefined> {
    return new Promise(async (resolve, reject) => {
        const db = await openDB();
        const tx = db.transaction("general", "readonly");
        const store = tx.objectStore("general");
        const getRequest = store.get(id);

        getRequest.onsuccess = () => {
            db.close();
            resolve(getRequest.result);
        };
        getRequest.onerror = () => reject(getRequest.error);
    });
}