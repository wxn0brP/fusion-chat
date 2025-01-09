import hub from "../../hub";
hub("components/contextMenu");

import contextMenuLib from "../../lib/contextMenuLib";
import Id from "../../types/Id";
import { Ui_contextMenu__channelOptions, Ui_contextMenu__messageOptions } from "../../types/ui/components";
import { Vars_realm__thread } from "../../types/var";
import permissionFunc from "../../utils/perm";
import utils from "../../utils/utils";
import vars from "../../var/var";

const contextMenu = {
    showMenu(e: MouseEvent, ele: HTMLElement, id: Id) {
        ele.setAttribute("_id", id);
        return contextMenuLib.menuShower(ele, e);
    },

    getByDataIdStyle(ele: HTMLElement, id: string) {
        return ele.querySelector<HTMLElement>(`[data-id='${id}']`).style;
    },

    message(e: MouseEvent, id: Id, opts: Ui_contextMenu__messageOptions) {
        const ele = document.querySelector("#mesage_context_menu");

        this.getByDataIdStyle(ele, "pin").display = opts.pin ? "" : "none";
        this.getByDataIdStyle(ele, "unpin").display = opts.pin ? "none" : "";
        this.getByDataIdStyle(ele, "delete").display = opts.delete ? "" : "none";
        this.getByDataIdStyle(ele, "edit").display = opts.edit ? "" : "none";
        this.getByDataIdStyle(ele, "add_reaction").display = vars.realm.chnlPerms[vars.chat.chnl]?.react ? "" : "none";
        this.getByDataIdStyle(ele, "create_thread").display = vars.realm.chnlPerms[vars.chat.chnl]?.threadCreate ? "" : "none";

        this.showMenu(e, ele, id);
    },

    realm(e: MouseEvent, id: Id) {
        const ele = document.querySelector("#realm_context_menu");
        this.showMenu(e, ele, id);
    },

    channel(e: MouseEvent, id: Id, opts: Ui_contextMenu__channelOptions) {
        opts = {
            type: "text",
            ...opts,
        }
        const ele = document.querySelector("#channel_context_menu");

        this.getByDataIdStyle(ele, "subscribe").display = ["realm_event", "open_event"].includes(opts.type) ? "" : "none";
        this.getByDataIdStyle(ele, "create_thread").display = vars.realm.chnlPerms[vars.chat.chnl]?.threadCreate ? "" : "none";

        this.showMenu(e, ele, id);
    },

    thread(e: MouseEvent, thread: Vars_realm__thread) {
        const ele = document.querySelector("#thread_context_menu");

        const permToDelete = vars.user._id === thread.author || permissionFunc.isAdmin();
        this.getByDataIdStyle(ele, "delete").display = permToDelete ? "" : "none";

        this.showMenu(e, ele, thread._id);
    },


    menuClickEvent(
        div: HTMLElement,
        call: (e: MouseEvent) => void,
        conditionCb?: (target: HTMLElement) => boolean
    ) {
        if (!utils.isMobile()) {
            div.addEventListener("contextmenu", (e) => {
                if (conditionCb && !conditionCb(e.target as HTMLElement)) return;
                e.preventDefault();
                call(e);
                return false;
            });
            return;
        }

        let time: number;
        let holdTimeout: NodeJS.Timeout;

        div.addEventListener("mousedown", startHold);
        div.addEventListener("touchstart", startHold);

        div.addEventListener("mouseup", cancelHold);
        div.addEventListener("touchend", cancelHold);

        function startHold(e: MouseEvent | TouchEvent) {
            time = new Date().getTime();
            let mouseEvent: MouseEvent;

            if (e instanceof TouchEvent) {
                mouseEvent = convertTouchEventToMouseEvent(e);
            } else {
                mouseEvent = e;
            }

            holdTimeout = setTimeout(() => {
                call(mouseEvent);
            }, 1300);
        }

        function cancelHold(e: MouseEvent | TouchEvent) {
            clearTimeout(holdTimeout);
            time = new Date().getTime() - time;
            if (time < 2000) return;

            e.preventDefault();
            return false;
        }
    },
}

function convertTouchEventToMouseEvent(touchEvent: TouchEvent): MouseEvent {
    const touch = touchEvent.touches[0];

    const mouseEvent = new MouseEvent(touchEvent.type, {
        clientX: touch.clientX,
        clientY: touch.clientY,
    });

    return mouseEvent;
}

export default contextMenu;