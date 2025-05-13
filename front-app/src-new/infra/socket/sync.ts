type SyncFn = () => void | Promise<void>;

const syncQueue: SyncFn[] = [];

export const syncManager = {
    register(fn: SyncFn) {
        syncQueue.push(fn);
    },

    async sync() {
        for (const fn of syncQueue) {
            fn();
        }
    }
};
