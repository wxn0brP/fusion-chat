import { Id } from "../id";

namespace Db_RealmRoles {
    export interface role {
        name: string,
        lvl: number,
        p: number,
        _id: Id;
        
        c?: string,
    }
}

export { Db_RealmRoles };
export default Db_RealmRoles;