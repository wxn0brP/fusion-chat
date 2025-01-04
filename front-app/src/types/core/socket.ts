import Id from "../Id";
import { Vars_user__activity } from "../var";

export interface Core_socket__refresh {
    evt: string;
    realm?: Id;
    chnl?: Id;
    wait?: number;
}

export interface Core_socket__dm {
    priv: Id;
    last: {
        main: Id;
    };
    lastMessId: Id;
}

export type Core_socket__user_startus_type = "online" | "offline" | "away";

export interface Core_socket__user_profile {
    _id: Id;
    name: string;
    status: Core_socket__user_startus_type;
    statusText: string;
    friendStatus: Core_socket__friendStatus;
    isBlocked: boolean;
    activity: Vars_user__activity;
}

export enum Core_socket__friendStatus {
    NOT_FRIEND,
    IS_FRIEND,
    REQUEST_SENT,
    REQUEST_RECEIVED,
}