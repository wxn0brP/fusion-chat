import { socket } from "./socket";
import {
    sck_connect,
    sck_error,
    sck_error_valid,
    sck_error_spam,
    sck_connect_error,
    sck_system_refreshToken,
    sck_refreshData,
    sck_connection_error,
} from "./logic/evt";

socket.on("connect", sck_connect);
socket.on("error", sck_error);
socket.on("connect_forbidden", (msg) => sck_connection_error("connect_forbidden", msg));
socket.on("connect_serverError", (msg) => sck_connection_error("connect_serverError", msg));
socket.on("connect_unauthorized", (msg) => sck_connection_error("connect_unauthorized", msg));
socket.on("error.valid", sck_error_valid);
socket.on("error.spam", sck_error_spam);
socket.on("connect_error", sck_connect_error);
socket.on("system.refreshToken", sck_system_refreshToken);
socket.on("refreshData", sck_refreshData);

socket.on("*", (...args: any[]) => {
    console.log("socket.on.*", ...args);
});