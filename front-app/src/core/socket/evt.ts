import hub from "../../hub";
hub("socket/_evt");

import socket from "./socket";
import {
    connect,
    error,
    error_valid,
    error_spam,
    connect_error,
    system_refreshToken,
    refreshData,
} from "./logic/evt";

socket.on("connect", connect);
socket.on("error", error);
socket.on("error.valid", error_valid);
socket.on("error.spam", error_spam);
socket.on("connect_error", connect_error);
socket.on("system.refreshToken", system_refreshToken);
socket.on("refreshData", refreshData);