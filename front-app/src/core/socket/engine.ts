import SocketController from "../cacheControllers/socketGeneral";
import {
    self_status_get,
    realm_users_sync,
    realm_users_activity_sync,
    realm_event_notify,
    user_status_update,
} from "./logic/evt";
import render_realm from "../../ui/render/realm";
import render_user from "../../ui/render/user";
import realmInit from "../../ui/render/realmInit";
import render_dm from "../../ui/render/dm";
import { friend_get_all, friend_requests_get } from "../../ui/components/mainView";
import hub from "../../hub";
import { message_fetch_pinned, realm_thread_list } from "./logic/mess";
hub("socket/engine");

const eventsBuilder = [
    ["self.status.get", self_status_get],
    ["realm.users.sync", realm_users_sync],
    ["realm.users.activity.sync", realm_users_activity_sync],
    ["realm.event.notify", realm_event_notify],
    ["user.status.update", user_status_update],
    ["user.status.update", user_status_update],

    ["dm.get", render_dm.dm_get],
    ["realm.get", render_realm.realms],
    ["realm.setup", realmInit],
    ["user.profile", render_user.userProfile],

    ["friend.get.all", friend_get_all],
    ["friend.requests.get", friend_requests_get],

    ["message.fetch.pinned", message_fetch_pinned],
    ["realm.thread.list", realm_thread_list],
] as const;

type EventKeys = (typeof eventsBuilder)[number][0];

export const socketEvt: Record<EventKeys, SocketController> = Object.fromEntries(
    eventsBuilder.map(([eventName, handler]) => [eventName, new SocketController(eventName, handler)])
) as Record<EventKeys, SocketController>;