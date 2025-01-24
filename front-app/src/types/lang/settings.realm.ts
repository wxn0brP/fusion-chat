export interface Lang_Settings__Realm {
    mess_permissions: {
        view: string;
        write: string;
        files: string;
        reactions: string;
        thread: string;
        thread_view: string;
        thread_write: string;
    }
    webhooks: {
        webhook: string;
        template: string;
        channel: string;
        advanced: string;
        ajv: string;
        required_fields: string;
        embed_settings: string;
        title: string;
        url: string;
        image: string;
        custom_fields: string;
        get_url_before: string;
        not_found: string;
    }
    edit_channel: string;
    subscribed_channels: string;
    edit_webhook: string;
    basic_settings: string;
    categories_and_channels: string;
    roles: string;
    users_manager: string;
    emoji_manager: string;
    realm_name: string;
    remove_image: string;
    delete_realm: string;
    add_category: string;
    move_up: string;
    move_down: string;
    add_channel: string;
    upload_emoji: string;
    add_webhook: string;
    enter_name: string;
    select_type: string;
    channel_types: {
        text: string;
        voice: string;
        announcement: string;
        open_announcement: string;
        forum: string;
    }
    category: string;
    unsubscribe_channel: string;
    confirm_unsubscribe: string;
    edit_category: string;
    delete_realm_confirm: {
        w1: string;
        w2: string;
        w3: string;
    }
    no_data: string;
    no_perm_to_edit_role: string;
    edit_role: string;
    role_permissions: {
        admin: string;
        manage_messages: string;
        ban_user: string;
        mute_user: string;
        kick_user: string;
        manage_roles: string;
        manage_emojis: string;
        manage_invites: string;
        manage_webhooks: string;
        manage_channels: string;
    }
    kick_user: string;
    banned_users: string;
    ban_user: string;
    unban_user: string;
    user_mgmt_confirms: {
        kick_sure: string;
        ban_sure: string;
        unban_sure: string;
    }
    failed_to_save: string;
    no_channels: string;
    rename_wrong: string;
}