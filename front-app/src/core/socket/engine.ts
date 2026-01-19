import { sck_friend_get_all, sck_friend_requests_get } from "#ui/components/mainView";
import { uir_dm } from "#ui/render/dm";
import { uir_realm } from "#ui/render/realm";
import { sck_realmInit } from "#ui/render/realmInit";
import { uir_user } from "#ui/render/user";
import { SocketController } from "../cacheControllers/socketGeneral";
import {
    sck_realm_event_notify,
    sck_realm_users_activity_sync,
    sck_realm_users_sync,
    sck_self_status_get,
    sck_user_status_update
} from "./logic/evt";
import { sck_message_fetch_pinned, sck_realm_thread_list } from "./logic/mess";

const eventsBuilder = [
    ["self.status.get", sck_self_status_get],
    ["realm.users.sync", sck_realm_users_sync],
    ["realm.users.activity.sync", sck_realm_users_activity_sync],
    ["realm.event.notify", sck_realm_event_notify],
    ["user.status.update", sck_user_status_update],
    ["user.status.update", sck_user_status_update],

    ["dm.get", uir_dm.sck_dm_get],
    ["realm.get", uir_realm.sck_realms],
    ["realm.setup", sck_realmInit],
    ["user.profile", uir_user.sck_userProfile],

    ["friend.get.all", sck_friend_get_all],
    ["friend.requests.get", sck_friend_requests_get],

    ["message.fetch.pinned", sck_message_fetch_pinned],
    ["realm.thread.list", sck_realm_thread_list],
] as const;

type EventKeys = (typeof eventsBuilder)[number][0];

export const socketEvt: Record<EventKeys, SocketController> = Object.fromEntries(
    eventsBuilder.map(([eventName, handler]) => [eventName, new SocketController(eventName, handler)])
) as Record<EventKeys, SocketController>;