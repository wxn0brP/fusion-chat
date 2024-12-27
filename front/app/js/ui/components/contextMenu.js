import hub from "../../hub.js";
hub("contextMenu");

import contextMenuLib from "../../lib/contextMenuLib.js";
import utils from "../../utils/utils.js";
import vars from "../../var/var.js";

const contextMenu = {
    showMenu(e, ele, id) {
        ele.setAttribute("_id", id);
        return contextMenuLib.menuShower(ele, e);
    },

    getByDataIdStyle(ele, id){
        return ele.querySelector(`[data-id='${id}']`).style;
    },

    message(e, id, opts={}){
        opts = {
            pin: true,
            delete: false,
            ...opts,
        }
        const ele = document.querySelector("#mesage_context_menu");

        this.getByDataIdStyle(ele, "pin").display = opts.pin ? "" : "none";
        this.getByDataIdStyle(ele, "unpin").display = opts.pin ? "none" : "";
        this.getByDataIdStyle(ele, "delete").display = opts.delete ? "" : "none";
        this.getByDataIdStyle(ele, "edit").display = opts.edit ? "" : "none";
        this.getByDataIdStyle(ele, "add_reaction").display = vars.realm.chnlPerms[vars.chat.chnl]?.react ? "" : "none";
        this.getByDataIdStyle(ele, "create_thread").display = vars.realm.chnlPerms[vars.chat.chnl]?.threadCreate ? "" : "none";

        this.showMenu(e, ele, id);
    },

    realm(e, id){
        const ele = document.querySelector("#realm_context_menu");
        this.showMenu(e, ele, id);
    },

    channel(e, id, opts={}){
        opts = {
            type: "text",
            ...opts,
        }
        const ele = document.querySelector("#channel_context_menu");

        this.getByDataIdStyle(ele, "subscribe").display = ["realm_event", "open_event"].includes(opts.type) ? "" : "none";
        this.getByDataIdStyle(ele, "create_thread").display = vars.realm.chnlPerms[vars.chat.chnl]?.threadCreate ? "" : "none";

        this.showMenu(e, ele, id);
    },

    thread(e, thread){
        const ele = document.querySelector("#thread_context_menu");

        const permToDelete = vars.realm.chnlPerms[thread.thread]?.threadDelete || vars.user._id === thread.author;
        this.getByDataIdStyle(ele, "delete").display = permToDelete ? "" : "none";

        this.showMenu(e, ele, thread._id);
    },

    menuClickEvent(div, call){
        if(!utils.isMobile()){
            div.addEventListener("contextmenu", (e) => {
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
    
        function startHold(e){
            time = new Date();
            if(e.type === "touchstart"){
                e.clientX = e.touches[0].clientX;
                e.clientY = e.touches[0].clientY;
            }
            holdTimeout = setTimeout(() => {
                call(e);
            }, 700);
        }
    
        function cancelHold(e){
            clearTimeout(holdTimeout);
            time = new Date() - time;
            if(time < 1000){
                return;
            }
            e.preventDefault();
            return false;
        }
    }
}

export default contextMenu;