import NodeCache from "node-cache";
import { Socket } from "socket.io";

export const bannedUsers = new NodeCache();

export interface SpamThresholds {
    warningDelay: number;
    warnLimit: number;
    spamLimit: number;
    disconnectLimit: number;
    resetInterval: number;
    banDuration: number;
}

class SocketEventLimiter {
    socket: Socket;
    eventCounters: Record<string, number>;
    resetTimers: Record<string, NodeJS.Timeout>;
    spamThresholds: SpamThresholds;

    constructor(socket: Socket, spamThresholds: Partial<SpamThresholds> = {}) {
        this.socket = socket;
        this.eventCounters = {};
        this.resetTimers = {};
        this.spamThresholds = {
            warningDelay: 100, // ms
            warnLimit: 1,
            spamLimit: 5,
            disconnectLimit: 15,
            resetInterval: 1000, // ms
            banDuration: 10 * 60 * 1000, // 10 minutes in ms
            ...spamThresholds
        };
    }

    /**
     * Limits the number of times a specific event can be emitted from the socket.
     * 
     * @param eventName - The name of the event to limit.
     * @param thresholds - Custom threshold values for spam detection. Number of times the event can be emitted.
     * @param originalCallback - The original callback to be called when the event is not limited.
     * @returns The event handler function.
     */
    onLimit(eventName: string, thresholdsParams: Partial<SpamThresholds> | number, originalCallback: Function) {
        const thresholds = typeof thresholdsParams === "number" ? { resetInterval: thresholdsParams } : thresholdsParams;
        // Merge custom thresholds with default values
        const spamThresholds: SpamThresholds = {
            ...this.spamThresholds,
            ...thresholds,
        };

        // Function to reset the event counter and timer
        const resetCounter = () => {
            delete this.eventCounters[eventName];
            delete this.resetTimers[eventName];
        };

        const handler = (...data: any[]) => {
            // Increment event counter
            this.eventCounters[eventName] = (this.eventCounters[eventName] || 0) + 1;
            const count = this.eventCounters[eventName];

            // Reset the timer for the event
            if (this.resetTimers[eventName]) clearTimeout(this.resetTimers[eventName]);
            this.resetTimers[eventName] = setTimeout(resetCounter, spamThresholds.resetInterval);

            // Handle warning delay
            if (count === spamThresholds.warnLimit + 1) {
                setTimeout(() => {
                    originalCallback(...data);
                }, spamThresholds.warningDelay);
                return;
            }

            // Emit warning if spam limit is approached
            if (count === spamThresholds.warnLimit + 2) {
                this.socket.emit("error.spam", "warn");
            }

            // Handle spam limit and emit last warning
            if (count > spamThresholds.warnLimit && count <= spamThresholds.spamLimit) {
                if(count === spamThresholds.spamLimit) {
                    const time = Math.ceil(spamThresholds.resetInterval / 1000) + 1
                    this.socket.emit("error.spam", "last", time);
                }
                return;
            }

            // Disconnect user if disconnect limit is exceeded
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

            // Call the original callback if no limits are exceeded
            originalCallback(...data);
        };

        // Register the event handler for the socket event
        this.socket.on(eventName, handler);
        return handler;
    }
}

export default SocketEventLimiter;
