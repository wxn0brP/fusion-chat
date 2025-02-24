import { Id } from "../id";

namespace Db_BotData {
    export interface owner {
        _id: "owner";
        owner: Id;
    }

    export interface name {
        _id: "name";
        name: string;
    }

    export interface realm {
        realm: Id;
    }

    export interface img {
        _id: "img";
    }
}

export default Db_BotData;
export { Db_BotData };