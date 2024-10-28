import { io } from "socket.io-client";
const link = process.env.socketLink || "https://fusion.ct8.pl/bot";

const socket = io(link, {
    transports: ["websocket"],
    auth: {
        token: null
    },
    autoconnect: false
});

export default socket;
