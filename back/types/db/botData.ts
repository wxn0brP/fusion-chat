import { Id } from "../base";

namespace Db_BotData {
    export interface owner {
        _id: "owner";
        owner: Id;
    }

    export interface name {
        _id: "name";
        name: string;
    }

    export interface perm {
        _id: "perm";
        perm: string[];
    }

    export interface realm {
        realm: Id;
    }
}

export default Db_BotData;
export { Db_BotData };