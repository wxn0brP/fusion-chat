import hub from "../hub.js";
hub("utils");
import apis from "../api/apis.js";
import uiInteract from "../ui/interact/ui.js";
const utils = {
    ss() {
        return window.innerWidth < 800;
    },
    isMobile() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    },
    extractTimeFromId(id) {
        if (!id)
            return 0;
        const timePart = id.split("-")[0];
        const timeUnix = parseInt(timePart, 36);
        return timeUnix;
    },
    formatDateFormUnix(unixTimestamp) {
        const date = new Date(unixTimestamp);
        const day = date.getDate();
        const month = date.getMonth() + 1;
        const year = date.getFullYear();
        const hours = date.getHours();
        const minutes = date.getMinutes();
        const formattedDate = `${day}.${month}.${year} ${hours}:${(minutes < 10 ? '0' : '')}${minutes}`;
        return formattedDate;
    },
    validId(id) {
        if (!id)
            return false;
        if (typeof id !== "string")
            return false;
        if (id.split("-").length != 3)
            return false;
        return true;
    },
    writeToClipboard(text) {
        return new Promise((resolve) => {
            navigator.clipboard.writeText(text).then(() => {
                resolve(true);
            }).catch(() => {
                uiInteract.clipboardError(text);
                resolve(false);
            });
        });
    },
    sendNotification(title, body, payload = {}) {
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
                    };
                }
                break;
            default:
                break;
        }
    },
    escape(selector) {
        return selector.replace(/([.&*+?^=!:${}()|\[\]\/\\])/g, "\\$1");
    },
    rmRef(obj) {
        return JSON.parse(JSON.stringify(obj));
    },
    getHighestRoleIndex(userRoles, roleHierarchy) {
        for (let i = 0; i < roleHierarchy.length; i++) {
            if (userRoles.includes(roleHierarchy[i])) {
                return i;
            }
        }
        return -1;
    }
};
export default utils;
//# sourceMappingURL=utils.js.map