import { apis } from "../api/apis";
import { Id } from "../types/Id";
import { uii_main } from "../ui/interact/ui";

export namespace utils {
    export function ss(): boolean {
        return window.innerWidth < 800;
    }

    export function isMobile(): boolean {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    }

    export function extractTimeFromId(id: Id): number {
        if (!id) return 0;
        const timePart = id.split("-")[0];
        const timeUnix = parseInt(timePart, 36);
        return timeUnix;
    }

    export function formatDateFormUnix(unixTimestamp: number): string {
        const date = new Date(unixTimestamp);

        const day = date.getDate();
        const month = date.getMonth() + 1;
        const year = date.getFullYear();
        const hours = date.getHours();
        const minutes = date.getMinutes();

        const formattedDate = `${day}.${month}.${year} ${hours}:${(minutes < 10 ? '0' : '')}${minutes}`;
        return formattedDate;
    }

    export function validId(id: Id): boolean {
        if (!id) return false;
        if (typeof id !== "string") return false;
        if (id.split("-").length != 3) return false;
        return true;
    }

    export function writeToClipboard(text: string): Promise<boolean> {
        return new Promise((resolve) => {
            navigator.clipboard.writeText(text).then(() => {
                resolve(true);
            }).catch(() => {
                uii_main.clipboardError(text);
                resolve(false);
            });
        })
    }

    export function sendNotification(title: string, body: string, payload: Record<string, any> = {}): void {
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
    }

    export function escape(selector: string): string {
        return selector.replace(/([.&*+?^=!:${}()|\[\]\/\\])/g, "\\$1");
    }

    export function rmRef<T>(obj: T): T {
        return JSON.parse(JSON.stringify(obj));
    }

    export function getHighestRoleIndex(userRoles: string[], roleHierarchy: string[]): number {
        for (let i = 0; i < roleHierarchy.length; i++) {
            if (userRoles.includes(roleHierarchy[i])) {
                return i;
            }
        }
        return -1;
    }
}