import { Channel_Type } from "../channel";
import Id from "../Id";
import { Vars_realm__chnlPerm, Vars_user__activity } from "../var";

export interface Ui_UserState {
    status?: string; // user status text displayed if not activity
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