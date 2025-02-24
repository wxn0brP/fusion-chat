import socket from "../socket/socket.js";
import hub from "../../hub.js";
hub("cacheControllers/socketGeneral");
class SocketController {
    evtName;
    cb;
    constructor(evtName, cb) {
        socket.on(evtName, cb);
        this.evtName = evtName;
        this.cb = cb;
    }
    async sendToSocket(key, ...data) {
        const customCb = typeof data[data.length - 1] === "function" ? data.pop() : null;
        socket.emit(this.evtName, ...data, async (...socketReturnData) => {
            await saveToDB({ id: key, data: [...socketReturnData] });
            if (customCb)
                customCb(...socketReturnData);
            else
                this.cb(...socketReturnData);
        });
    }
    async emitId(id = "", ...data) {
        const key = this.evtName + (id ? "-" + id : "");
        if (socket.connected) {
            await this.sendToSocket(key, ...data);
        }
        else {
            const cachedData = await getFromDB(key);
            const customCb = typeof data[data.length - 1] === "function" ? data.pop() : null;
            if (cachedData) {
                if (customCb)
                    customCb(...cachedData.data);
                else
                    this.cb(...cachedData.data);
            }
            else {
                await this.sendToSocket(key, ...data);
            }
        }
    }
    async emit(...data) {
        this.emitId("", ...data);
    }
    async emitDataId(id, ...data) {
        this.emitId(id, ...[id, ...data]);
    }
}
export default SocketController;
export function openDB() {
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
export function saveToDB(entry) {
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
export function getFromDB(id) {
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
//# sourceMappingURL=socketGeneral.js.map