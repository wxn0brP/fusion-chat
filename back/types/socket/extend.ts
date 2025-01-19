import { Id } from "../base";
import { Socket_StandardRes } from "./res";
import { Socket_User } from "./user";

declare module "socket.io" {
    interface Socket {
        user: Socket_User;
        voiceRoom: Id;
        logError: (e: Error) => void;
        isShouldRefresh: boolean;
        onLimit: (event: string, limit: number, fn: Function) => void;
        timeOutMap: Map<string, {t: number, i: number}>
        processSocketError: (err: Socket_StandardRes, cb?: Function) => boolean
    }
}