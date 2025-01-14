import { Id } from "../base";

namespace Logic_PermSys {
    export interface createRole__opts {
        lvl?: number;
        p?: number | number[];
        c?: string;
        managerId?: Id | false;
    }
}

export default Logic_PermSys;