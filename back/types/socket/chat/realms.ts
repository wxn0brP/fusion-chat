import { Id } from "../../../types/base";

namespace Socket__Realms {
    export interface Event__req {
        type: "voice" | "custom";
        where: Id | string;
        topic: string;
        time: number; // unix timestamp
        desc?: string; // description
        img?: string; // image url
    }
}

export default Socket__Realms;