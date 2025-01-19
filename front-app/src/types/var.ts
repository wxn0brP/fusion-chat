import { Core_mess__dbMessage } from "./core/mess";
import { Core_socket__blocked, Core_socket__user_status_type } from "./core/socket";
import Id from "./Id";
import { Utils_updater } from "./utils";

interface Vars {
    user: {
        _id: Id;
        fr: Id;
        status: Core_socket__user_status_type;
        statusText: string;
    };
    chat: {
        to: Id;
        chnl: Id;
        actMess: number;
        pinned: Vars_mess__pinned[];
        selectedMess: Id | null;
    };
    temp: {
        scrollBlock: boolean;
        replyId: Id | null;
        editId: Id | null;
    }; // temporary
    apisTemp: {
        user: {
            main: {
                [id: Id]: string;
            };
            [chat: Id]: {
                [id: Id]: string | 0; // 0 if user haven't realm nick
            }
        };
        chat: {
            [id: Id]: string;
        };
        user_status: {
            [id: Id]: {
                status: Utils_updater<string>;
                activity: Utils_updater<Vars_user__activity | null>;
            }
        };
    };
    lastMess: {
        [id: Id]: {
            main?: {
                read: Id;
                mess: Id;
            }
            [id: Id]: {
                read: Id;
                mess: Id;
            }
        }
    };
    privs: Id[];
    realms: Vars_realms[];
    realm: Vars_realm;
    mainView: {
        friends: Vars_mainView__friend[];
        page: Vars_mainView__page;
        requests: Id[];
    };
    settings: {
        notifications: boolean;
        desktopHandling: boolean;
    },
    blocked: Core_socket__blocked[];
}

export interface Vars_realm__role {
    _id: Id;
    c: string;
    name: string;
}

export interface Vars_realm__user {
    uid: Id;
    roles: Id[];
}

export interface Vars_realm__thread{
    _id: Id;
    thread: Id;
    name: string;
    reply: Id;
    author: Id;
}

export interface Vars_realm {
    users: Vars_realm__user[];
    roles: Vars_realm__role[];
    permission: number;
    text: string[];
    desc: {
        [id: Id]: string;
    },
    chnlPerms: {
        [id: Id]: Vars_realm__chnlPerm;
    }
    threads: Vars_realm__thread[];
}

export interface Vars_mess__pinned extends Core_mess__dbMessage {
    chnl: Id;
    pinned: true;
}

export interface Vars_user__activity {
    state: string;
    name: string;
    endTime: number;

    startTime?: number;
    details?: string;
    logoName?: string;
    logoText?: string;

    party?: {
        id: Id;
        state: number;
        max?: number;
    }
}

export interface Vars_realms {
    realm: Id;
    img: boolean;
    last?: {
        [id: Id]: Id;
    }
    muted?: number;
    p: number;
}

export interface Vars_realm__chnlPerm {
    view: boolean;
    write: boolean;
    file: boolean;
    react: boolean;
    threadCreate: boolean;
    threadView: boolean;
    threadWrite: boolean;
}

export interface Vars_mainView__friend {
    _id: Id;
    status?: string;
    text?: string;
}

export type Vars_mainView__page = "all" | "online" | "offline" | "requests";

export default Vars;