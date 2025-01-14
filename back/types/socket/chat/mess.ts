namespace Socket__Mess{
    export interface message_edit__opts {
        minMsg?: number;
        maxMsg?: number;
    }

    export interface MessageQuery {
        from?: string;
        mentions?: string;
        before?: string;
        during?: string;
        after?: string;
        pinned?: boolean;
        message?: string;
    }
}

export default Socket__Mess;