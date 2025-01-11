import { Id } from "../base";

namespace Db_UserData {
    export interface realm {
        realm: Id;
        muted?: number;
        last?: pr_last;
    }

    export interface priv {
        priv: Id;
        blocked?: boolean;
        last?: pr_last;
    }

    export interface pr_last {
        [chnl: string]: Id;
    }

    export interface nick {
        nick: string;
    }

    export interface bot {
        botID: Id;
    }

    export interface status {
        _id: "status";
        status: "online" | "offline" | "away";
        text: string;
    }
}

export { Db_UserData };
export default Db_UserData;