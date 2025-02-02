import { Lang_Settings__Realm } from "../../types/lang/settings.realm"

const sr: Lang_Settings__Realm = {
    mess_permissions: {
        view: "View channel",
        write: "Write messages",
        files: "Send files",
        reactions: "Add reactions",
        thread: "Thread create",
        thread_view: "Thread view",
        thread_write: "Thread write messages",
    },
    webhooks: {
        webhook: "Webhooks",
        template: "Template",
        channel: "Channel",
        advanced: "Advanced",
        ajv: "Ajv",
        required_fields: "Required fields",
        embed_settings: "Embed settings",
        title: "Title",
        url: "Url",
        image: "Image",
        custom_fields: "Custom fields",
        get_url_before: "Save webhook (and settings) first to get URL",
        not_found: "Webhook not found",
    },
    edit_channel: "Edit channel",
    subscribed_channels: "Subscribed channels",
    edit_webhook: "Edit webhook",
    basic_settings: "Basic Settings",
    categories_and_channels: "Categories & Channels",
    roles: "Roles",
    users_manager: "Users Manager",
    emoji_manager: "Emoji Manager",
    realm_name: "Realm name",
    remove_image: "Remove image",
    delete_realm: "Delete realm",
    add_category: "Add category",
    move_up: "Move up",
    move_down: "Move down",
    add_channel: "Add channel",
    upload_emoji: "Upload Emoji",
    add_webhook: "Add webhook",
    enter_name: "Enter name",
    select_type: "Select type",
    category: "Category",
    channel_types: {
        text: "Text",
        voice: "Voice",
        open_announcement: "Open announcement",
        announcement: "Announcement",
        forum: "Forum",
    },
    unsubscribe_channel: "Unsubscribe",
    confirm_unsubscribe: "Are you sure you want to unsubscribe from $",
    edit_category: "Edit category",
    delete_realm_confirm: {
        w1: "Are you sure you want to delete this realm",
        w2: "Are you sure you want to delete all data of this realm",
        w3: "Are you sure you want to delete all messages of this realm"
    },
    no_data: "No settings data",
    no_perm_to_edit_role: "You don't have permission to edit this role",
    edit_role: "Edit role",
    role_permissions: {
        admin: "Admin",
        manage_messages: "Manage messages",
        ban_user: "Ban user",
        mute_user: "Mute user",
        kick_user: "Kick user",
        manage_roles: "Manage roles",
        manage_emojis: "Manage emojis",
        manage_invites: "Manage invites",
        manage_webhooks: "Manage webhooks",
        manage_channels: "Manage channels",
    },
    banned_users: "Banned users",
    ban_user: "Ban user",
    kick_user: "Kick user",
    unban_user: "Unban user",
    user_mgmt_confirms: {
        kick_sure: "Are you sure you want to kick $",
        ban_sure: "Are you sure you want to kick and ban $",
        unban_sure: "Are you sure you want to unban $",
    },
    failed_to_save: "Failed to save settings. Make sure all settings are valid",
    no_channels: "No channels found",
    delete_wrong_name: "Wrong realm name",
    confirm_realm_name: "Are you sure you want to delete this realm",
}

export default sr;