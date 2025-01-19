import { Id } from "../base";

namespace Db_RealmUser {
    export interface user {
        u: Id;
        r: Id[];
    }

    export interface bot {
        bot: Id;
        r: Id[];
    }

    export type data = user | bot;
}

export default Db_RealmUser;
export { Db_RealmUser };