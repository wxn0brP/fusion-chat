import { Channel_Type } from "../channel";
import { Core_socket__user_status_type } from "../core/socket";
import Id from "../Id";
import { Vars_realm__chnlPerm, Vars_user__activity } from "../var";

export interface Ui_UserState {
    status?: Core_socket__user_status_type;
    statusText?: string;
    activity?: Vars_user__activity
}

export interface Ui_render__channel {
    name: string;
    type: Channel_Type;
    desc: string;
    id: Id;
    perms: Vars_realm__chnlPerm;
}

export interface Ui_render__category{
    name: string;
    chnls: Ui_render__channel[];
    id: Id;
}

export interface Ui_render__event{
    _id: Id;
    author: Id;
    type: "voice" | "custom";
    where: Id | string;
    topic: string;
    time: number;
    desc?: string;
    img?: string;
    users: Id[];
}