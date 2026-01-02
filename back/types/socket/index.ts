import { GLSocket } from "@wxn0brp/gloves-link-server";
import { Socket_StandardRes } from "./res";
import { Socket_User } from "./user";

export interface FCSocket extends GLSocket {
    user: Socket_User;
    logError: (e: Error) => void;
    isShouldRefresh: boolean;
    onLimit: (event: string, limit: number, fn: Function) => void;
    timeOutMap: Map<string, { t: number; i: number }>;
    processSocketError: (err: Socket_StandardRes, cb?: Function) => boolean;
}