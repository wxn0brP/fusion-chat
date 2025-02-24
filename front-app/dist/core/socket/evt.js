import hub from "../../hub.js";
hub("socket/_evt");
import socket from "./socket.js";
import { connect, error, error_valid, error_spam, connect_error, system_refreshToken, refreshData, } from "./logic/evt.js";
socket.on("connect", connect);
socket.on("error", error);
socket.on("error.valid", error_valid);
socket.on("error.spam", error_spam);
socket.on("connect_error", connect_error);
socket.on("system.refreshToken", system_refreshToken);
socket.on("refreshData", refreshData);
//# sourceMappingURL=evt.js.map