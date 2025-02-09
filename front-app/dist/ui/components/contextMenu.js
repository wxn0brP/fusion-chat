import hub from "../../hub.js";
hub("components/contextMenu");
import contextMenuLib from "../../lib/contextMenuLib.js";
import permissionFunc, { PermissionFlags } from "../../utils/perm.js";
import utils from "../../utils/utils.js";
import vars from "../../var/var.js";
const contextMenu = {
    showMenu(e, ele, id) {
        ele.setAttribute("_id", id);
        return contextMenuLib.menuShower(ele, e);
    },
    message(e, id, opts) {
        const ele = document.querySelector("#message_context_menu");
        setDisplayByDataId(ele, "pin", opts.pin);
        setDisplayByDataId(ele, "unpin", !opts.pin);
        setDisplayByDataId(ele, "delete", opts.delete);
        setDisplayByDataId(ele, "edit", opts.edit);
        setDisplayByDataId(ele, "add_reaction", vars.realm.chnlPerms[vars.chat.chnl]?.react);
        setDisplayByDataId(ele, "create_thread", vars.realm.chnlPerms[vars.chat.chnl]?.threadCreate);
        this.showMenu(e, ele, id);
    },
    realm(e, id) {
        const ele = document.querySelector("#realm_context_menu");
        setDisplayByDataId(ele, "settings", canUserManageRealm(id));
        this.showMenu(e, ele, id);
    },
    channel(e, id, opts) {
        opts = {
            type: "text",
            ...opts,
        };
        const ele = document.querySelector("#channel_context_menu");
        setDisplayByDataId(ele, "subscribe", ["announcement", "open_announcement"].includes(opts.type));
        setDisplayByDataId(ele, "create_thread", vars.realm.chnlPerms[vars.chat.chnl]?.threadCreate);
        this.showMenu(e, ele, id);
    },
    thread(e, thread) {
        const ele = document.querySelector("#thread_context_menu");
        const permToDelete = vars.user._id === thread.author || permissionFunc.isAdmin();
        setDisplayByDataId(ele, "delete", permToDelete);
        this.showMenu(e, ele, thread._id);
    },
    menuClickEvent(div, call, conditionCb) {
        if (!utils.isMobile()) {
            div.addEventListener("contextmenu", (e) => {
                if (conditionCb && !conditionCb(e.target))
                    return;
                e.preventDefault();
                call(e);
                return false;
            });
            return;
        }
        let time;
        let holdTimeout;
        div.addEventListener("mousedown", startHold);
        div.addEventListener("touchstart", startHold);
        div.addEventListener("mouseup", cancelHold);
        div.addEventListener("touchend", cancelHold);
        function startHold(e) {
            time = new Date().getTime();
            let mouseEvent;
            if (e instanceof TouchEvent) {
                mouseEvent = convertTouchEventToMouseEvent(e);
            }
            else {
                mouseEvent = e;
            }
            holdTimeout = setTimeout(() => {
                call(mouseEvent);
            }, 1300);
        }
        function cancelHold(e) {
            clearTimeout(holdTimeout);
            time = new Date().getTime() - time;
            if (time < 2000)
                return;
            e.preventDefault();
            return false;
        }
    },
};
function convertTouchEventToMouseEvent(touchEvent) {
    const touch = touchEvent.touches[0];
    const mouseEvent = new MouseEvent(touchEvent.type, {
        clientX: touch.clientX,
        clientY: touch.clientY,
    });
    return mouseEvent;
}
function getByDataIdStyle(ele, id) {
    return ele.querySelector(`[data-id='${id}']`).style;
}
function setDisplayByDataId(ele, id, display) {
    getByDataIdStyle(ele, id).display = display ? "" : "none";
}
function canUserManageRealm(id) {
    const requiredPermissions = [
        PermissionFlags.Admin,
        PermissionFlags.ManageChannels,
        PermissionFlags.ManageRoles,
        PermissionFlags.ManageWebhooks,
        PermissionFlags.ManageEmojis,
    ];
    const perm = vars.realms.find((realm) => realm.realm === id)?.p || 0;
    return permissionFunc.hasAnyPermission(perm, requiredPermissions);
}
export default contextMenu;
//# sourceMappingURL=contextMenu.js.map