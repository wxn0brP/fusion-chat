import { Id } from "../base";
import Db_Mess from "./mess";

namespace Db_RealmConf {
    export interface set {
        _id: "set";
        name: string;
        owner: Id;
        img?: boolean;
    }

    export interface category {
        cid: Id;
        name: string;
        i: number;
    }

    export interface channel {
        chid: Id;
        category: Id;
        name: string;
        type: 'text' | 'voice' | 'announcement' | 'open_announcement';
        i: number;
        rp: RolePermission[];
        desc?: string;
    }

    export type RolePermission = `${Id}/${number}`;

    export interface webhook {
        whid: string;
        name: string;
        template: string;
        chnl: string;
        ajv: object;
        required: string[];
        embed?: Db_Mess.Embed;
    }

    export interface emoji {
        unicode: number;
        name: string;
    }
}

export default Db_RealmConf;
export { Db_RealmConf };