import { Lang_UI } from "../../types/lang/ui";

const ui: Lang_UI = {
    voice_show: "Voice Show",
    add_dm: "Add Direct Message",
    reply_to_message: "Reply to message",
    edit_message: "Edit message",
    online: "Online",
    offline: "Offline",
    add_friend: "Add friend",
    friend_requests: "Friend requests",
    no_friends: "No friends",
    no_requests: "No requests",
    copy_text: "Copy Text",
    reply: "Reply",
    copy_id: "Copy ID",
    add_reaction: "Add Reaction",
    pin_message: "Pin Message",
    unpin_message: "Unpin Message",
    create_thread: "Create Thread",
    create_thread_name: "Name of the thread",
    copy_invite: "Copy Invite",
    exit_from_realm: "Exit From Realm",
    subscribe_channel: "Subscribe",
    disconnect: "Disconnect",
    users: "Users",
    open_link: "Do you want to open this link",
    create_realm: "Create realm",
    join_realm: "Join realm",
    write_message: "Write message here",
    file: {
        size_limit: "File size exceeds $ limit",
        name_limit: "File name exceeds $ char limit",
        uploaded: "File uploaded successfully",
        upload_error: "Failed to upload file",
    },
    message: {
        placeholder: "Write message here",
        read_only: "You can't write in this channel",
        user_not_found: "User not found",
        command: "Command Input",
        invalid_link: "Invalid link",
        search_results: "Search results",
        search_no_results: "No result found",
        no_react: "You can't react in this channel",
        block_placeholder: {
            blocked: "This user blocked you",
            block: "You blocked this user",
        }
    },
    pinned_messages: "Pinned messages",
    no_pinned_messages: "No pinned messages",
    new_message: "Received message from $",
    failed_to_load_message: "Failed to load this message",
    failed_to_load_messages: "Failed to load all messages",
    confirm: {
        remove_friend: "Do you really want to remove $ from your friends list",
        removeF_friend_request:
            "Do you really want to remove $ from your friend requests list",
        sure: "Are you sure",
        call_to: "Are you sure you want to call $",
        exit_realm: "Are you sure you want to exit from $ realm",
        delete_thread: "Are you sure you want to delete this thread",
        delete_message: "Are you sure you want to delete this message",
    },
    friend: {
        request: "Friend request from $ (click to show)",
        declined: "Declined friend request from $",
        accepted: "Accepted friend request from $",
        add: "Add friend",
        remove: "Remove friend",
        block: "Block",
        unblock: "Unblock",
        request_received: "Request received (click to view)",
        request_sent: "Friend request sent (click to cancel)",
        open_dm: "Open DM",
    },
    call: {
        call: "Call",
        offline: "$ is offline",
        wait: "Do you want join to call and wait",
        called: "$ is calling you. Accept",
        rejected: "Call rejected",
        answer: "$ accepted your call. Join in this device",
        left: "$ left the voice channel",
        joined: "$ joined to voice channel",
        select_audio_device: "Select audio device",
        select_video_device: "Select video device",
    },
    clipboard: {
        error: "Failed to copy to clipboard",
        error_text: "Please copy manually",
    },
    copied: "Copied to clipboard",
    muted: "Muted",
    unmuted: "Unmuted",
    mute: {
        mute: "Mute",
        is_permanent: "Mute is permanent",
        ends_at: "Mute ends at $",
        realm: "Mute realm ($)",
        unmute: "Unmute",
    },
    status: "Status",
    durations: {
        minutes15: "15 minutes",
        hour1: "1 hour",
        day1: "1 day",
        permanently: "Permanently",
    },
    cancel: "Cancel",
    enter_friend: "Enter friend Name",
    channel: {
        channel: "Channel",
        no_permission: "You can't have permission to join this voice channel",
    },
    author: "Author",
    event: {
        desc: "Description",
        topic: "Topic",
        time: "Time",
        where: "Where",
        type: "Type",
        type_custom: "Custom",
        type_voice: "Voice",
        img: "Image URL or empty",
        notif: "Event $ on $ has started (click to open)",
    },
    enter_dm: "Name of the 2 people",
    enter_realm_invite: "Enter invite link of the realm",
    create_realm_name: "Enter name of the realm",
}

export default ui;