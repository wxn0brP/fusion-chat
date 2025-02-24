import SocketEventEngine from "./engine.js";
import { realm_create, realm_exit, realm_get, realm_join, realm_mute, dm_block, dm_create, dm_get, } from "./logic/chats.js";
import { friend_get_all, friend_requests_get, friend_remove, friend_request, friend_response, friend_request_remove, user_profile } from "./logic/friends.js";
import sendMessage from "../../logic/sendMessage.js";
import { message_delete, messages_delete, message_edit, message_fetch, message_fetch_pinned, message_mark_read, message_pin, message_react, message_search, message_fetch_id, } from "./logic/mess.js";
import { get_ogs, send_embed_og, send_embed_data, fireToken_get, status_activity_set, status_activity_get, status_activity_gets, status_activity_remove, user_delete } from "./logic/other.js";
import { realm_delete, realm_emojis_sync, realm_users_sync, realm_setup, realm_user_kick, realm_user_unban, realm_announcement_channel_subscribe, realm_announcement_channel_unsubscribe, realm_announcement_channel_available, realm_announcement_channel_list, realm_thread_create, realm_thread_delete, realm_thread_list, realm_users_activity_sync, realm_event_create, realm_event_delete, realm_event_list, realm_event_join, realm_event_leave, realm_event_get_topic, } from "./logic/realms.js";
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVnaXN0ZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9iYWNrL3NvY2tldC9jaGF0L3JlZ2lzdGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUNBLE9BQU8saUJBQWlCLE1BQU0sVUFBVSxDQUFDO0FBRXpDLE9BQU8sRUFDSCxZQUFZLEVBQ1osVUFBVSxFQUNWLFNBQVMsRUFDVCxVQUFVLEVBQ1YsVUFBVSxFQUNWLFFBQVEsRUFDUixTQUFTLEVBQ1QsTUFBTSxHQUNULE1BQU0sZUFBZSxDQUFDO0FBRXZCLE9BQU8sRUFDSCxjQUFjLEVBQ2QsbUJBQW1CLEVBQ25CLGFBQWEsRUFDYixjQUFjLEVBQ2QsZUFBZSxFQUNmLHFCQUFxQixFQUNyQixZQUFZLEVBQ2YsTUFBTSxpQkFBaUIsQ0FBQztBQUV6QixPQUFPLFdBQVcsTUFBTSxvQkFBb0IsQ0FBQztBQUM3QyxPQUFPLEVBQ0gsY0FBYyxFQUNkLGVBQWUsRUFDZixZQUFZLEVBQ1osYUFBYSxFQUNiLG9CQUFvQixFQUNwQixpQkFBaUIsRUFDakIsV0FBVyxFQUNYLGFBQWEsRUFDYixjQUFjLEVBQ2QsZ0JBQWdCLEdBQ25CLE1BQU0sY0FBYyxDQUFDO0FBRXRCLE9BQU8sRUFDSCxPQUFPLEVBQ1AsYUFBYSxFQUNiLGVBQWUsRUFDZixhQUFhLEVBQ2IsbUJBQW1CLEVBQ25CLG1CQUFtQixFQUNuQixvQkFBb0IsRUFDcEIsc0JBQXNCLEVBQ3RCLFdBQVcsRUFDZCxNQUFNLGVBQWUsQ0FBQztBQUV2QixPQUFPLEVBQ0gsWUFBWSxFQUNaLGlCQUFpQixFQUNqQixnQkFBZ0IsRUFDaEIsV0FBVyxFQUNYLGVBQWUsRUFDZixnQkFBZ0IsRUFDaEIsb0NBQW9DLEVBQ3BDLHNDQUFzQyxFQUN0QyxvQ0FBb0MsRUFDcEMsK0JBQStCLEVBQy9CLG1CQUFtQixFQUNuQixtQkFBbUIsRUFDbkIsaUJBQWlCLEVBQ2pCLHlCQUF5QixFQUN6QixrQkFBa0IsRUFDbEIsa0JBQWtCLEVBQ2xCLGdCQUFnQixFQUNoQixnQkFBZ0IsRUFDaEIsaUJBQWlCLEVBQ2pCLHFCQUFxQixHQUN4QixNQUFNLGdCQUFnQixDQUFDO0FBRXhCLE9BQU8sRUFDSCxlQUFlLEVBQ2Ysa0JBQWtCLEVBQ2xCLG9CQUFvQixHQUN2QixNQUFNLGtCQUFrQixDQUFDO0FBWTFCLE1BQU0sQ0FBQyxNQUFNLGFBQWEsR0FBYTtJQUNuQyxDQUFDLGNBQWMsRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLFlBQVksQ0FBQztJQUUxQyxDQUFDLGdCQUFnQixFQUFFLElBQUksRUFBRSxLQUFLLEVBQUUsY0FBYyxDQUFDO0lBQy9DLENBQUMsaUJBQWlCLEVBQUUsSUFBSSxFQUFFLEtBQUssRUFBRSxlQUFlLENBQUM7SUFDakQsQ0FBQyxlQUFlLEVBQUUsR0FBRyxFQUFFLElBQUksRUFBRSxhQUFhLENBQUM7SUFDM0MsQ0FBQyxrQkFBa0IsRUFBRSxHQUFHLEVBQUUsSUFBSSxFQUFFLGdCQUFnQixDQUFDO0lBQ2pELENBQUMsZUFBZSxFQUFFLEdBQUcsRUFBRSxLQUFLLEVBQUUsYUFBYSxDQUFDO0lBQzVDLENBQUMsZ0JBQWdCLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxjQUFjLENBQUM7SUFDOUMsQ0FBQyxhQUFhLEVBQUUsSUFBSSxFQUFFLEtBQUssRUFBRSxXQUFXLENBQUM7SUFDekMsQ0FBQyxzQkFBc0IsRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLG9CQUFvQixDQUFDO0lBRTFELENBQUMsU0FBUyxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsT0FBTyxDQUFDO0lBQ2hDLENBQUMsZUFBZSxFQUFFLElBQUksRUFBRSxLQUFLLEVBQUUsYUFBYSxDQUFDO0lBQzdDLENBQUMsaUJBQWlCLEVBQUUsSUFBSSxFQUFFLEtBQUssRUFBRSxlQUFlLENBQUM7SUFFakQsQ0FBQyxhQUFhLEVBQUUsR0FBRyxFQUFFLElBQUksRUFBRSxXQUFXLENBQUM7SUFDdkMsQ0FBQyxrQkFBa0IsRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLGdCQUFnQixDQUFDO0lBQ2xELENBQUMsMkJBQTJCLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSx5QkFBeUIsQ0FBQztJQUNwRSxDQUFDLGlCQUFpQixFQUFFLElBQUksRUFBRSxLQUFLLEVBQUUsZUFBZSxDQUFDO0lBQ2pELENBQUMsa0JBQWtCLEVBQUUsSUFBSSxFQUFFLEtBQUssRUFBRSxnQkFBZ0IsQ0FBQztJQUNuRCxDQUFDLG1CQUFtQixFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsaUJBQWlCLENBQUM7SUFDcEQsQ0FBQyxpQ0FBaUMsRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLCtCQUErQixDQUFDO0lBQ2hGLENBQUMscUJBQXFCLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxtQkFBbUIsQ0FBQztJQUN4RCxDQUFDLHFCQUFxQixFQUFFLElBQUksRUFBRSxLQUFLLEVBQUUsbUJBQW1CLENBQUM7SUFDekQsQ0FBQyxtQkFBbUIsRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLGlCQUFpQixDQUFDO0lBQ3BELENBQUMsb0JBQW9CLEVBQUUsSUFBSSxFQUFFLEtBQUssRUFBRSxrQkFBa0IsQ0FBQztJQUN2RCxDQUFDLG9CQUFvQixFQUFFLElBQUksRUFBRSxLQUFLLEVBQUUsa0JBQWtCLENBQUM7SUFDdkQsQ0FBQyxrQkFBa0IsRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLGdCQUFnQixDQUFDO0lBQ2xELENBQUMsdUJBQXVCLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxxQkFBcUIsQ0FBQztDQUUvRCxDQUFDO0FBRUYsTUFBTSxDQUFDLE1BQU0sVUFBVSxHQUFhO0lBQ2hDLENBQUMsV0FBVyxFQUFFLEdBQUcsRUFBRSxJQUFJLEVBQUUsU0FBUyxDQUFDO0lBQ25DLENBQUMsUUFBUSxFQUFFLEdBQUcsRUFBRSxJQUFJLEVBQUUsTUFBTSxDQUFDO0lBQzdCLENBQUMsY0FBYyxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsWUFBWSxDQUFDO0lBQzFDLENBQUMsWUFBWSxFQUFFLElBQUksRUFBRSxLQUFLLEVBQUUsVUFBVSxDQUFDO0lBQ3ZDLENBQUMsV0FBVyxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsU0FBUyxDQUFDO0lBQ3BDLENBQUMsWUFBWSxFQUFFLElBQUksRUFBRSxLQUFLLEVBQUUsVUFBVSxDQUFDO0lBQ3ZDLENBQUMsWUFBWSxFQUFFLElBQUksRUFBRSxLQUFLLEVBQUUsVUFBVSxDQUFDO0lBQ3ZDLENBQUMsVUFBVSxFQUFFLElBQUksRUFBRSxLQUFLLEVBQUUsUUFBUSxDQUFDO0lBRW5DLENBQUMsZ0JBQWdCLEVBQUUsSUFBSSxFQUFFLEtBQUssRUFBRSxjQUFjLENBQUM7SUFDL0MsQ0FBQyxpQkFBaUIsRUFBRSxJQUFJLEVBQUUsS0FBSyxFQUFFLGVBQWUsQ0FBQztJQUNqRCxDQUFDLHVCQUF1QixFQUFFLElBQUksRUFBRSxLQUFLLEVBQUUscUJBQXFCLENBQUM7SUFDN0QsQ0FBQyxlQUFlLEVBQUUsSUFBSSxFQUFFLEtBQUssRUFBRSxhQUFhLENBQUM7SUFDN0MsQ0FBQyxnQkFBZ0IsRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLGNBQWMsQ0FBQztJQUM5QyxDQUFDLHFCQUFxQixFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsbUJBQW1CLENBQUM7SUFFeEQsQ0FBQyxNQUFNLEVBQUUsR0FBRyxFQUFFLEtBQUs7UUFDZixLQUFLLEVBQUUsS0FBa0IsRUFBRSxHQUFZLEVBQUUsRUFBRTtZQUN2QyxPQUFPLE1BQU0sV0FBVyxDQUFDLEdBQUcsRUFBRSxLQUFLLENBQUMsQ0FBQztRQUN6QyxDQUFDO0tBQ0o7SUFDRCxDQUFDLGNBQWMsRUFBRSxJQUFJLEVBQUUsS0FBSyxFQUFFLFlBQVksQ0FBQztJQUMzQyxDQUFDLG1CQUFtQixFQUFFLEdBQUcsRUFBRSxJQUFJLEVBQUUsaUJBQWlCLENBQUM7SUFFbkQsQ0FBQyxlQUFlLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxhQUFhLENBQUM7SUFDNUMsQ0FBQyxxQkFBcUIsRUFBRSxJQUFJLEVBQUUsS0FBSyxFQUFFLG1CQUFtQixDQUFDO0lBQ3pELENBQUMscUJBQXFCLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxtQkFBbUIsQ0FBQztJQUN4RCxDQUFDLHNCQUFzQixFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsb0JBQW9CLENBQUM7SUFDMUQsQ0FBQyx3QkFBd0IsRUFBRSxJQUFJLEVBQUUsS0FBSyxFQUFFLHNCQUFzQixDQUFDO0lBQy9ELENBQUMsYUFBYSxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsV0FBVyxDQUFDO0lBRTFDLENBQUMsY0FBYyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsWUFBWSxDQUFDO0lBQzVDLENBQUMsc0NBQXNDLEVBQUUsSUFBSSxFQUFFLEtBQUssRUFBRSxvQ0FBb0MsQ0FBQztJQUMzRixDQUFDLHdDQUF3QyxFQUFFLElBQUksRUFBRSxLQUFLLEVBQUUsc0NBQXNDLENBQUM7SUFDL0YsQ0FBQyxzQ0FBc0MsRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLG9DQUFvQyxDQUFDO0lBQzFGLENBQUMsa0JBQWtCLEVBQUUsSUFBSSxFQUFFLEtBQUssRUFBRSxnQkFBZ0IsQ0FBQztJQUNuRCxDQUFDLG1CQUFtQixFQUFFLElBQUksRUFBRSxLQUFLLEVBQUUsaUJBQWlCLENBQUM7SUFFckQsQ0FBQyxvQkFBb0IsRUFBRSxJQUFJLEVBQUUsS0FBSyxFQUFFLGtCQUFrQixDQUFDO0lBQ3ZELENBQUMsaUJBQWlCLEVBQUUsR0FBRyxFQUFFLElBQUksRUFBRSxlQUFlLENBQUM7SUFDL0MsQ0FBQyxzQkFBc0IsRUFBRSxHQUFHLEVBQUUsS0FBSyxFQUFFLG9CQUFvQixDQUFDO0NBQzdELENBQUM7QUFFRixlQUFlLENBQUMsTUFBYyxFQUFFLEVBQUU7SUFDOUIsTUFBTSxNQUFNLEdBQUcsSUFBSSxpQkFBaUIsQ0FBQyxNQUFNLENBQUMsQ0FBQztJQUU3QyxLQUFLLE1BQU0sS0FBSyxJQUFJLGFBQWEsRUFBRSxDQUFDO1FBQ2hDLE1BQU0sQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxFQUFFLEtBQUssQ0FBQyxDQUFDLENBQUMsRUFBRSxLQUFLLENBQUMsQ0FBQyxDQUFDLEVBQUUsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDdkQsQ0FBQztJQUVELEtBQUssTUFBTSxLQUFLLElBQUksVUFBVSxFQUFFLENBQUM7UUFDN0IsTUFBTSxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLEVBQUUsS0FBSyxDQUFDLENBQUMsQ0FBQyxFQUFFLEtBQUssQ0FBQyxDQUFDLENBQUMsRUFBRSxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUN2RCxDQUFDO0FBQ0wsQ0FBQyxDQUFBIn0=