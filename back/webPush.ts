import db from "#db";
import { WebPush_Opts } from "#types/webPush";
import { readFileSync } from "fs";
import webpush, { PushSubscription } from "web-push";
import { io } from "./socket/server";

const webCfg = JSON.parse(
    readFileSync("config/webPush.json", "utf8"),
);

webpush.setVapidDetails(
    "mailto:" + webCfg.email,
    webCfg.publicKey,
    webCfg.privateKey
);

export async function webPushSend(opts: WebPush_Opts) {
    if (!webCfg.privateKey) {
        console.error("webPushSend: no privateKey");
        return;
    }

    if (opts.checkSocket)
        if (io.room("user-" + opts.to).size > 0)
            return;

    const subscriptions = await db.data.find<{ u: string, data: PushSubscription, _id: string }>("webPush", { u: opts.to });
    if (subscriptions.length == 0) return;

    const url = new URL(webCfg.url);
    if (opts.params) {
        for (const [key, value] of Object.entries(opts.params)) {
            url.searchParams.set(key, value);
        }
    }

    const notificationPayload = {
        notification: {
            title: opts.title,
            body: opts.body,
            icon: opts.icon ?? "/favicon.png",
            url
        },
    };

    const payload = JSON.stringify(notificationPayload);

    try {
        const subToDel = [];
        subscriptions.forEach(sub => {
            try {
                if (sub.data.expirationTime && sub.data.expirationTime * 1000 < Date.now()) {
                    subToDel.push(sub._id);
                    return;
                }
                webpush.sendNotification(sub.data, payload);
            } catch (e) {
                if (process.env.NODE_ENV == "development")
                    console.log("Firebase error: ", e.message);
            }
        });

        if (subToDel.length > 0)
            db.data.remove("webPush", { $in: { _id: subToDel } });
    } catch { }
}