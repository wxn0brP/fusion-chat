import { Id } from "../base";

namespace Logic_Webhook {
    export interface webhook_builder {
        chat: Id;
        chnl: Id;
        name: string;
        template: string;
        ajv: object;
        required: string[];
    }

    export interface webhook_query {
        token: string;
        silent?: string;
    }
}

export default Logic_Webhook;