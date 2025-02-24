import NodeCache from "node-cache";
export const bannedUsers = new NodeCache();
class SocketEventLimiter {
    socket;
    eventCounters;
    resetTimers;
    spamThresholds;
    constructor(socket, spamThresholds = {}) {
        this.socket = socket;
        this.eventCounters = {};
        this.resetTimers = {};
        this.spamThresholds = {
            warningDelay: 100,
            warnLimit: 1,
            spamLimit: 5,
            disconnectLimit: 15,
            resetInterval: 1000,
            banDuration: 10 * 60 * 1000,
            ...spamThresholds
        };
    }
    onLimit(eventName, thresholdsParams, originalCallback) {
        const thresholds = typeof thresholdsParams === "number" ? { resetInterval: thresholdsParams } : thresholdsParams;
        const spamThresholds = {
            ...this.spamThresholds,
            ...thresholds,
        };
        const resetCounter = () => {
            delete this.eventCounters[eventName];
            delete this.resetTimers[eventName];
        };
        const handler = (...data) => {
            this.eventCounters[eventName] = (this.eventCounters[eventName] || 0) + 1;
            const count = this.eventCounters[eventName];
            if (this.resetTimers[eventName])
                clearTimeout(this.resetTimers[eventName]);
            this.resetTimers[eventName] = setTimeout(resetCounter, spamThresholds.resetInterval);
            if (count === spamThresholds.warnLimit + 1) {
                setTimeout(() => {
                    originalCallback(...data);
                }, spamThresholds.warningDelay);
                return;
            }
            if (count === spamThresholds.warnLimit + 2) {
                this.socket.emit("error.spam", "warn");
            }
            if (count > spamThresholds.warnLimit && count <= spamThresholds.spamLimit) {
                if (count === spamThresholds.spamLimit) {
                    const time = Math.ceil(spamThresholds.resetInterval / 1000) + 1;
                    this.socket.emit("error.spam", "last", time);
                }
                return;
            }
            if (count > spamThresholds.disconnectLimit) {
                const banTime = Date.now() + spamThresholds.banDuration;
                bannedUsers.set(this.socket.user._id, banTime, spamThresholds.banDuration);
                const sockets = global.getSocket(this.socket.user._id);
                sockets.forEach(socket => {
                    socket.emit("error.spam", "ban", spamThresholds.banDuration);
                    socket.disconnect();
                });
                return;
            }
            originalCallback(...data);
        };
        this.socket.on(eventName, handler);
        return handler;
    }
}
export default SocketEventLimiter;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGltaXRlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL2JhY2svc29ja2V0L2NoYXQvbGltaXRlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLFNBQVMsTUFBTSxZQUFZLENBQUM7QUFHbkMsTUFBTSxDQUFDLE1BQU0sV0FBVyxHQUFHLElBQUksU0FBUyxFQUFFLENBQUM7QUFXM0MsTUFBTSxrQkFBa0I7SUFDcEIsTUFBTSxDQUFTO0lBQ2YsYUFBYSxDQUF5QjtJQUN0QyxXQUFXLENBQWlDO0lBQzVDLGNBQWMsQ0FBaUI7SUFFL0IsWUFBWSxNQUFjLEVBQUUsaUJBQTBDLEVBQUU7UUFDcEUsSUFBSSxDQUFDLE1BQU0sR0FBRyxNQUFNLENBQUM7UUFDckIsSUFBSSxDQUFDLGFBQWEsR0FBRyxFQUFFLENBQUM7UUFDeEIsSUFBSSxDQUFDLFdBQVcsR0FBRyxFQUFFLENBQUM7UUFDdEIsSUFBSSxDQUFDLGNBQWMsR0FBRztZQUNsQixZQUFZLEVBQUUsR0FBRztZQUNqQixTQUFTLEVBQUUsQ0FBQztZQUNaLFNBQVMsRUFBRSxDQUFDO1lBQ1osZUFBZSxFQUFFLEVBQUU7WUFDbkIsYUFBYSxFQUFFLElBQUk7WUFDbkIsV0FBVyxFQUFFLEVBQUUsR0FBRyxFQUFFLEdBQUcsSUFBSTtZQUMzQixHQUFHLGNBQWM7U0FDcEIsQ0FBQztJQUNOLENBQUM7SUFVRCxPQUFPLENBQUMsU0FBaUIsRUFBRSxnQkFBa0QsRUFBRSxnQkFBMEI7UUFDckcsTUFBTSxVQUFVLEdBQUcsT0FBTyxnQkFBZ0IsS0FBSyxRQUFRLENBQUMsQ0FBQyxDQUFDLEVBQUUsYUFBYSxFQUFFLGdCQUFnQixFQUFFLENBQUMsQ0FBQyxDQUFDLGdCQUFnQixDQUFDO1FBRWpILE1BQU0sY0FBYyxHQUFtQjtZQUNuQyxHQUFHLElBQUksQ0FBQyxjQUFjO1lBQ3RCLEdBQUcsVUFBVTtTQUNoQixDQUFDO1FBR0YsTUFBTSxZQUFZLEdBQUcsR0FBRyxFQUFFO1lB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