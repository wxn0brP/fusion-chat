import globalExpose from "#bus";
import type SocketIOClient from "socket.io-client";
declare var io: typeof SocketIOClient;

const socket = io("/", {
    transports: ["websocket"],
    auth: {
        token: localStorage.getItem("token")
    },
    autoConnect: false,
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    reconnectionAttempts: Infinity,
});

export default socket;

globalExpose("vars", "socket", socket);