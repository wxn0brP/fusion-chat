import { Socket_event, Socket_StandardRes } from "#types/socket/res";

export default class ValidError {
    module: Socket_event;

    constructor(module: Socket_event) {
        this.module = module;
    }

    valid(...err: any[]): Socket_StandardRes {
        return {
            err: ["error.valid", this.module, ...err]
        }
    }

    err(...err: any[]): Socket_StandardRes {
        return {
            err: ["error", this.module, ...err]
        }
    }
}