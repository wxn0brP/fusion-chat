import SocketEventEngine from "./engine";

import {
	dm_block,
	dm_create,
	dm_get,
	realm_create,
	realm_exit,
	realm_get,
	realm_join,
	realm_mute,
} from "./logic/chats";

import {
	friend_get_all,
	friend_remove,
	friend_request,
	friend_request_remove,
	friend_requests_get,
	friend_response,
	user_profile,
} from "./logic/friends";

import sendMessage from "#logic/sendMessage";
import {
	message_delete,
	message_edit,
	message_fetch,
	message_fetch_id,
	message_fetch_pinned,
	message_mark_read,
	message_pin,
	message_react,
	message_search,
	messages_delete,
} from "./logic/mess";

import {
	fireToken_get,
	get_ogs,
	send_embed_data,
	send_embed_og,
	status_activity_get,
	status_activity_gets,
	status_activity_remove,
	status_activity_set,
	user_delete,
} from "./logic/other";

import {
	realm_announcement_channel_available,
	realm_announcement_channel_list,
	realm_announcement_channel_subscribe,
	realm_announcement_channel_unsubscribe,
	realm_delete,
	realm_emojis_sync,
	realm_event_create,
	realm_event_delete,
	realm_event_get_topic,
	realm_event_join,
	realm_event_leave,
	realm_event_list,
	realm_setup,
	realm_thread_create,
	realm_thread_delete,
	realm_thread_list,
	realm_user_kick,
	realm_user_role_add,
	realm_user_role_remove,
	realm_user_unban,
	realm_users_activity_sync,
	realm_users_sync,
} from "./logic/realms";

import { Request } from "#types/sendMessage";
import { FCSocket } from "#types/socket";
import { Socket_StandardRes } from "#types/socket/res";
import { Socket_User } from "#types/socket/user";
import {
	profile_set_nickname,
	self_status_get,
	self_status_update,
} from "./logic/settings";

export type Events = [
	string,
	number,
	boolean,
	(user: Socket_User, ...args: any[]) => Promise<Socket_StandardRes>,
];

export const generalEvents: Events[] = [
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
	[
		"realm.announcement.channel.list",
		5000,
		true,
		realm_announcement_channel_list,
	],
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

export const userEvents: Events[] = [
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

	[
		"mess",
		200,
		false,
		async (suser: Socket_User, req: Request) => {
			return await sendMessage(req, suser);
		},
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
	[
		"realm.announcement.channel.subscribe",
		1000,
		false,
		realm_announcement_channel_subscribe,
	],
	[
		"realm.announcement.channel.unsubscribe",
		1000,
		false,
		realm_announcement_channel_unsubscribe,
	],
	[
		"realm.announcement.channel.available",
		5000,
		true,
		realm_announcement_channel_available,
	],
	["realm.event.join", 1000, false, realm_event_join],
	["realm.event.leave", 1000, false, realm_event_leave],

	["self.status.update", 1000, false, self_status_update],
	["self.status.get", 100, true, self_status_get],
	["profile.set_nickname", 100, false, profile_set_nickname],
];

export default (socket: FCSocket) => {
	const engine = new SocketEventEngine(socket);

	for (const event of generalEvents) {
		engine.add(event[0], event[1], event[2], event[3]);
	}

	for (const event of userEvents) {
		engine.add(event[0], event[1], event[2], event[3]);
	}
};
