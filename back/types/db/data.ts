import { Id } from "../base";

namespace Db_Data {
    export interface fireToken {
        fc: string;
        fire: string;
        user: string;
        exp: number;
    }

    export interface friendRequest {
        fr: Id;
        to: Id;
    }

    export interface rm {
        _id: Id;
    }

    export interface token {
        token: string;
    }

    export interface user {
        _id: Id;
        name: string;
        email: string;
        password: string;
    }
}

export default Db_Data;
export { Db_Data };