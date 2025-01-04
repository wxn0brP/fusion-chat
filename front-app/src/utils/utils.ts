import hub from "../hub";
hub("utils");

import apis from "../api/apis";
import Id from "../types/Id";
import uiInteract from "../ui/interact/ui";

const utils = {
    ss(): boolean {
        return window.innerWidth < 800;
    },

    isMobile(): boolean {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    },

    parseJSONC(jsonc: string): any {
        const json = jsonc.replace(/\/\/.*|\/\*[\s\S]*?\*\//g, '');
        return JSON.parse(json);
    },

    extractTimeFromId(id: Id): number {
        if (!id) return 0;
        const timePart = id.split("-")[0];
        const timeUnix = parseInt(timePart, 36);
        return timeUnix;
    },

    formatDateFormUnux(unixTimestamp: number): string {
        const date = new Date(unixTimestamp * 1000);

        const day = date.getDate();
        const month = date.getMonth() + 1;
        const year = date.getFullYear();
        const hours = date.getHours();
        const minutes = date.getMinutes();

        const formattedDate = `${day}.${month}.${year} ${hours}:${(minutes < 10 ? '0' : '')}${minutes}`;
        return formattedDate;
    },

    validId(id: Id): boolean {
        if (!id) return false;
        if (typeof id !== "string") return false;
        if (id.split("-").length != 3) return false;
        return true;
    },

    writeToClipboard(text: string): Promise<boolean> {
        return new Promise((resolve) => {
            navigator.clipboard.writeText(text).then(() => {
                resolve(true);
            }).catch(() => {
                uiInteract.clipboardError(text);
                resolve(false);
            });
        })
    },

    sendNotification(title: string, body: string, payload: Record<string, any> = {}): void {
        switch (apis.app.apiType) {
            case "rn":
            case "ele":
                apis.api.send({
                    type: "notif",
                    title,
                    msg: body,
                    payload
                });
                break;
            case "web":
                if (Notification.permission === "granted") {
                    const notification = new Notification(title, { body: body });
                    notification.onclick = () => {
                        window.focus();
                        notification.close();
                    }
                }
                break;
            default:
                break;
        }
    },

    escape(selector: string): string {
        return selector.replace(/([.&*+?^=!:${}()|\[\]\/\\])/g, "\\$1");
    }
}

export default utils;