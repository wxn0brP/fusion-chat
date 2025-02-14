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
    self_status_get,
    realm_users_sync,
    realm_users_activity_sync,
    realm_event_notify,
    user_status_update,
} from "./logic/evt";

socket.on("connect", connect);
socket.on("error", error);
socket.on("error.valid", error_valid);
socket.on("error.spam", error_spam);
socket.on("connect_error", connect_error);
socket.on("system.refreshToken", system_refreshToken);
socket.on("refreshData", refreshData);
socket.on("self.status.get", self_status_get);
socket.on("realm.users.sync", realm_users_sync);
socket.on("realm.users.activity.sync", realm_users_activity_sync);
socket.on("realm.event.notify", realm_event_notify);
socket.on("user.status.update", user_status_update);