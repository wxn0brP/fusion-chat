import hub from "../../hub";
import { mglVar } from "../../var/mgl";
hub("socket");

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
mglVar.socket = socket;