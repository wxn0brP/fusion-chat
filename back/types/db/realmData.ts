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
}

export default Db_RealmData;
export { Db_RealmData };