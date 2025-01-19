import { Id } from "../base";

namespace Db_Logs {
    export interface uncaughtException {
        error: string;
        stackTrace: string;
        _id: Id;
    }

    export interface unhandledRejection {
        reason: any
        promise: any
        _id: Id;
    }

    export interface socketIo {
        error: string;
        stackTrace: string;
        _id: Id;
    }

    export interface spam {
        user: Id;
        evt: string;
        _id: Id;
        ban?: true;
    }
}

export { Db_Logs };
export default Db_Logs;