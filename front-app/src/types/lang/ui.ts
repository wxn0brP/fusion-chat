export interface Lang_UI {
    voice_show: string;
    add_dm: string;
    reply_to_message: string;
    edi_message: string;
    online: string;
    offline: string;
    add_friend: string;
    friend_requests: string;
    no_friends: string;
    no_requests: string;
    copy_text: string;
    reply: string;
    copy_id: string;
    add_reaction: string;
    pin_message: string;
    unpin_message: string;
    create_thread: string;
    create_thread_name: string;
    copy_invite: string;
    exit_from_realm: string;
    subscribe_channel: string;
    disconnect: string;
    users: string;
    open_link: string;
    create_realm: string;
    join_realm: string;
    write_message: string;
    file: {
        size_limit: string;
        name_limit: string;
        uploaded: string;
        upload_error: string;
    }
    message: {
        placeholder: string;
        read_only: string;
        user_not_found: string;
        command: string;
        invalid_link: string;
        search_results: string;
        search_no_results: string;
        no_react: string;
        block_placeholder: {
            blocked: string;
            block: string;
        }
    }
    pinned_messages: string;
    no_pinned_messages: string;
    new_message: string;
    failed_to_load_message: string;
    failed_to_load_messages: string;
    confirm: {
        remove_friend: string;
        removeF_friend_request: string;
        sure: string;
        call_to: string;
        exit_realm: string;
        delete_thread: string;
        delete_message: string;
    }
    friend: {
        request: string;
        declined: string;
        accepted: string;
        add: string;
        remove: string;
        request_sent: string;
        request_received: string;
        unblock: string;
        block: string;
        open_dm: string;
    }
    call: {
        call: string;
        offline: string;
        wait: string;
        called: string;
        rejected: string;
        answer: string;
        left: string;
        joined: string;
        select_audio_device: string;
        select_video_device: string;
    }
    clipboard: {
        error: string;
        error_text: string;
    }
    copied: string;
    muted: string;
    unmuted: string;
    mute: {
        mute: string;
        is_permanent: string;
        ends_at: string;
        unmute: string;
        realm: string;
    }
    status: string;
    durations: {
        minutes15: string;
        hour1: string;
        day1: string;
        permanently: string;
    }
    cancel: string;
    enter_friend: string;
    channel: {
        channel: string;
        no_permission: string;
    }
    author: string;
    event: {
        topic: string;
        time: string;
        desc: string;
        where: string;
        type: string;
        type_voice: string;
        type_custom: string;
        img: string;
        notif: string;
    },
    enter_dm: string;
    create_realm_name: string;
    enter_realm_invite: string;
}
