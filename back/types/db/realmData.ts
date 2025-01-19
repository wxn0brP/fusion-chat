import { Id } from "../base";

namespace Db_RealmData {
    export interface events_channels {
        sr: Id;
        sc: Id;
        tr: Id;
        tc: Id;
    }

    export interface bot {
        bid: Id;
        name: string;
    }

    export interface ban {
        user: Id;
    }

    export interface user {
        uid: Id;
        name: string;
    }

    export interface thread {
        thread: Id;
        name: string;
        author: Id;
        reply?: Id;
        _id?: Id;
    }

    export interface event {
        _id: Id;
        evt: true;
        author: Id;
        type: string;
        where: Id | string;
        topic: string;
        time: number;
        desc?: string;
        img?: string;
    }

    export interface event_user {
        uevt: Id;
        u: Id;
    }
}

export default Db_RealmData;
export { Db_RealmData };