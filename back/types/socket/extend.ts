import { Socket } from "socket.io";
import { Id } from "../id";
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

declare global {
    var getSocket: (to: string, room?: string) => Socket[];
    var sendToSocket: (id: Id, channel: string, ...args: any) => void;
    var sendToChatUsers: (to: Id, channel: string, ...args: any) => void;
}