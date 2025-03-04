import SocketEventEngine from "./engine.js";
import { realm_create, realm_exit, realm_get, realm_join, realm_mute, dm_block, dm_create, dm_get, } from "./logic/chats.js";
import { friend_get_all, friend_requests_get, friend_remove, friend_request, friend_response, friend_request_remove, user_profile } from "./logic/friends.js";
import sendMessage from "../../logic/sendMessage.js";
import { message_delete, messages_delete, message_edit, message_fetch, message_fetch_pinned, message_mark_read, message_pin, message_react, message_search, message_fetch_id, } from "./logic/mess.js";
import { get_ogs, send_embed_og, send_embed_data, fireToken_get, status_activity_set, status_activity_get, status_activity_gets, status_activity_remove, user_delete } from "./logic/other.js";
import { realm_delete, realm_emojis_sync, realm_users_sync, realm_setup, realm_user_kick, realm_user_unban, realm_announcement_channel_subscribe, realm_announcement_channel_unsubscribe, realm_announcement_channel_available, realm_announcement_channel_list, realm_thread_create, realm_thread_delete, realm_thread_list, realm_users_activity_sync, realm_event_create, realm_event_delete, realm_event_list, realm_event_join, realm_event_leave, realm_event_get_topic, realm_user_role_remove, realm_user_role_add, } from "./logic/realms.js";
import { self_status_get, self_status_update, profile_set_nickname, } from "./logic/settings.js";
export const generalEvents = [
    ["user.profile", 1000, true, user_profile],
    ["message.delete", 1000, false, message_delete],
    ["messages.delete", 1000, false, messages_delete],
    ["message.fetch", 300, true, message_fetch],
    ["message.fetch.id", 300, true, message_fetch_id],
    ["message.react", 100, false, message_react],
    ["message.search", 1000, true, message_search],
    ["message.pin", 1000, false, message_pin],
    ["message.fetch.pinned", 1000, true, message_fetch_pinned],
    ["get.ogs", 1000, true, get_ogs],
    ["send.embed.og", 1000, false, send_embed_og],
    ["send.embed.data", 1000, false, send_embed_data],
    ["realm.setup", 100, true, realm_setup],
    ["realm.users.sync", 1000, true, realm_users_sync],
    ["realm.users.activity.sync", 1000, true, realm_users_activity_sync],
    ["realm.user.kick", 1000, false, realm_user_kick],
    ["realm.user.unban", 1000, false, realm_user_unban],
    ["realm.emojis.sync", 1000, true, realm_emojis_sync],
    ["realm.announcement.channel.list", 5000, true, realm_announcement_channel_list],
    ["realm.thread.create", 1000, true, realm_thread_create],
    ["realm.thread.delete", 1000, false, realm_thread_delete],
    ["realm.thread.list", 1000, true, realm_thread_list],
    ["realm.event.create", 1000, false, realm_event_create],
    ["realm.event.delete", 1000, false, realm_event_delete],
    ["realm.event.list", 1000, true, realm_event_list],
    ["realm.event.get.topic", 1000, true, realm_event_get_topic],
    ["realm.user.role.remove", 1000, false, realm_user_role_remove],
    ["realm.user.role.add", 1000, false, realm_user_role_add],
];
export const userEvents = [
    ["realm.get", 100, true, realm_get],
    ["dm.get", 100, true, dm_get],
    ["realm.create", 1000, true, realm_create],
    ["realm.exit", 1000, false, realm_exit],
    ["dm.create", 1000, true, dm_create],
    ["realm.join", 1000, false, realm_join],
    ["realm.mute", 1000, false, realm_mute],
    ["dm.block", 1000, false, dm_block],
    ["friend.request", 1000, false, friend_request],
    ["friend.response", 1000, false, friend_response],
    ["friend.request.remove", 1000, false, friend_request_remove],
    ["friend.remove", 1000, false, friend_remove],
    ["friend.get.all", 1000, true, friend_get_all],
    ["friend.requests.get", 1000, true, friend_requests_get],
    ["mess", 200, false,
        async (suser, req) => {
            return await sendMessage(req, suser);
        }
    ],
    ["message.edit", 1000, false, message_edit],
    ["message.mark.read", 100, true, message_mark_read],
    ["fireToken.get", 1000, true, fireToken_get],
    ["status.activity.set", 1000, false, status_activity_set],
    ["status.activity.get", 1000, true, status_activity_get],
    ["status.activity.gets", 1000, true, status_activity_gets],
    ["status.activity.remove", 1000, false, status_activity_remove],
    ["user.delete", 50000, false, user_delete],
    ["realm.delete", 10000, false, realm_delete],
    ["realm.announcement.channel.subscribe", 1000, false, realm_announcement_channel_subscribe],
    ["realm.announcement.channel.unsubscribe", 1000, false, realm_announcement_channel_unsubscribe],
    ["realm.announcement.channel.available", 5000, true, realm_announcement_channel_available],
    ["realm.event.join", 1000, false, realm_event_join],
    ["realm.event.leave", 1000, false, realm_event_leave],
    ["self.status.update", 1000, false, self_status_update],
    ["self.status.get", 100, true, self_status_get],
    ["profile.set_nickname", 100, false, profile_set_nickname],
];
export default (socket) => {
    const engine = new SocketEventEngine(socket);
    for (const event of generalEvents) {
        engine.add(event[0], event[1], event[2], event[3]);
    }
    for (const event of userEvents) {
        engine.add(event[0], event[1], event[2], event[3]);
    }
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVnaXN0ZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9iYWNrL3NvY2tldC9jaGF0L3JlZ2lzdGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUNBLE9BQU8saUJBQWlCLE1BQU0sVUFBVSxDQUFDO0FBRXpDLE9BQU8sRUFDSCxZQUFZLEVBQ1osVUFBVSxFQUNWLFNBQVMsRUFDVCxVQUFVLEVBQ1YsVUFBVSxFQUNWLFFBQVEsRUFDUixTQUFTLEVBQ1QsTUFBTSxHQUNULE1BQU0sZUFBZSxDQUFDO0FBRXZCLE9BQU8sRUFDSCxjQUFjLEVBQ2QsbUJBQW1CLEVBQ25CLGFBQWEsRUFDYixjQUFjLEVBQ2QsZUFBZSxFQUNmLHFCQUFxQixFQUNyQixZQUFZLEVBQ2YsTUFBTSxpQkFBaUIsQ0FBQztBQUV6QixPQUFPLFdBQVcsTUFBTSxvQkFBb0IsQ0FBQztBQUM3QyxPQUFPLEVBQ0gsY0FBYyxFQUNkLGVBQWUsRUFDZixZQUFZLEVBQ1osYUFBYSxFQUNiLG9CQUFvQixFQUNwQixpQkFBaUIsRUFDakIsV0FBVyxFQUNYLGFBQWEsRUFDYixjQUFjLEVBQ2QsZ0JBQWdCLEdBQ25CLE1BQU0sY0FBYyxDQUFDO0FBRXRCLE9BQU8sRUFDSCxPQUFPLEVBQ1AsYUFBYSxFQUNiLGVBQWUsRUFDZixhQUFhLEVBQ2IsbUJBQW1CLEVBQ25CLG1CQUFtQixFQUNuQixvQkFBb0IsRUFDcEIsc0JBQXNCLEVBQ3RCLFdBQVcsRUFDZCxNQUFNLGVBQWUsQ0FBQztBQUV2QixPQUFPLEVBQ0gsWUFBWSxFQUNaLGlCQUFpQixFQUNqQixnQkFBZ0IsRUFDaEIsV0FBVyxFQUNYLGVBQWUsRUFDZixnQkFBZ0IsRUFDaEIsb0NBQW9DLEVBQ3BDLHNDQUFzQyxFQUN0QyxvQ0FBb0MsRUFDcEMsK0JBQStCLEVBQy9CLG1CQUFtQixFQUNuQixtQkFBbUIsRUFDbkIsaUJBQWlCLEVBQ2pCLHlCQUF5QixFQUN6QixrQkFBa0IsRUFDbEIsa0JBQWtCLEVBQ2xCLGdC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