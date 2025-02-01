import { Id } from "../types/base";

declare global {
    var firebaseAdmin: typeof import("firebase-admin");
    var fireBaseMessage: {
        send: (data: {
            to: Id,
            title: string,
            body: string,
            checkSocket?: boolean,
            action?: {
                type: string,
                data: any[]
            }
        }) => void;
    }
}