import hub from "../../hub.js";
import { mglVar } from "../../var/mgl.js";
hub("socket");
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
//# sourceMappingURL=socket.js.map