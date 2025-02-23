import { Id } from "../id";

namespace Db_Mess {
    export interface Message {
        _id: Id;
        fr: Id;
        msg: string;
        chnl: Id;

        lastEdit?: string; // number with 36 system
        res?: Id;
        pinned?: boolean;
        reacts?: {
            [react: string]: Id[]
        }
        embed?: Embed;
        enc?: string; // actual not used
    }

    export interface Embed {
        title: string;

        url?: string;
        description?: string;
        image?: string;
        customFields?: Record<string, string>;
    }
}

export { Db_Mess };
export default Db_Mess;