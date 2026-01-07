import socket from "./socket";
import {
    connect,
    error,
    error_valid,
    error_spam,
    connect_error,
    system_refreshToken,
    refreshData,
    connection_error,
} from "./logic/evt";

socket.on("connect", connect);
socket.on("error", error);
socket.on("connect_forbidden", (msg) => connection_error("connect_forbidden", msg));
socket.on("connect_serverError", (msg) => connection_error("connect_serverError", msg));
socket.on("connect_unauthorized", (msg) => connection_error("connect_unauthorized", msg));
socket.on("error.valid", error_valid);
socket.on("error.spam", error_spam);
socket.on("connect_error", connect_error);
socket.on("system.refreshToken", system_refreshToken);
socket.on("refreshData", refreshData);

socket.on("*", (...args: any[]) => {
    console.log("socket.on.*", ...args);
})