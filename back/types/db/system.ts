import { Actions } from "../../schedule/actions";
import { Id } from "../id";

namespace Db_System {
    export interface encryptionKey {
        index: number;
        pub: string;
        prv: string;
    }

    export interface task {
        _id: Id;
        sType: task_sType;
        type: Actions;
        sTime: number;
        data: any;
    }

    export type task_sType = "one-time"; // add more if implemented
}

export { Db_System };
export default Db_System;