import { Id } from "../base";
import { Socket_User } from "./user";

declare module "socket.io" {
    interface Socket {
        user: Socket_User;
        voiceRoom: Id;
    }
}