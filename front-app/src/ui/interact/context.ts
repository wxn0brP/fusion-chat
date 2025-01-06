import hub from "../../hub";
hub("interact/context");

import uiInteract from "./ui";
import vars from "../../var/var";
import apis from "../../api/apis";
import utils from "../../utils/utils";
import uiFunc from "../helpers/uiFunc";
import coreFunc from "../../core/coreFunc";
import socket from "../../core/socket/socket";
import permissionFunc from "../../utils/perm";
import translateFunc from "../../utils/translate";
import { messHTML, mglInt } from "../../var/html";
import messInteract from "../../core/mess/interact";
import subscribeEventChnl from "../interact/subscribeEventChnl";
import { Context__channel, Context__message, Context__realm, Context__thread } from "../../types/context";

const contextFunc = {
    message(type: Context__message){
        const id = document.querySelector("#mesage_context_menu").getAttribute("_id");
        switch(type){
            case "copy":
                const message = document.querySelector("#mess__"+id+" .mess_content").getAttribute("_plain");
                utils.writeToClipboard(message).then(ok => {
                    if(ok) uiFunc.uiMsg("Copied message!");
                });
            break;
            case "edit":
                uiInteract.editMess(id);
            break;
            case "delete":
                uiInteract.deleteMess(id);
            break;
            case "reply":
                vars.temp.replyId = id;
                messHTML.replyClose.style.display = "block";
                (document.querySelector("#mess__"+id) as HTMLElement).style.backgroundColor = "var(--panel)";
            break;
            case "copy_id":
                utils.writeToClipboard(id).then(ok => {
                    if(ok) uiFunc.uiMsg("Copied message ID!");
                })
            break;
            case "add_reaction":
                const chnl = vars.chat.chnl;
                if(chnl){
                    if(!vars.realm.chnlPerms[chnl].react) return uiFunc.uiMsg(translateFunc.get("You can't react in this channel") + "!");
                }
                messInteract.emocjiPopup((e) => {
                    if(!e) return;
                    socket.emit("message.react", vars.chat.to, id, e);
                });
            break;
            case "pin":
            case "unpin":
                socket.emit("message.pin", vars.chat.to, vars.chat.chnl, id, type === "pin");
            break;
            case "create_thread":
                uiInteract.createThread(id);
            break;
            default:
                const n: never = type;
                console.error(n);
        }
    },

    realm(type: Context__realm){
        const id = document.querySelector("#realm_context_menu").getAttribute("_id");
        switch(type){
            case "copy_id":
                utils.writeToClipboard(id).then(ok => {
                    if(ok) uiFunc.uiMsg(translateFunc.get("Copied realm ID") + "!");
                });
            break;
            case "copy_invite":
                // socket.emit("getInviteLink", id);
                const link = location.protocol + "//" + location.host + "/ir?id=" + id;
                utils.writeToClipboard(link).then(ok => {
                    if(ok) uiFunc.uiMsg(translateFunc.get("Copied invite link") + "!");
                });
            break;
            case "exit":
                const conf = confirm(translateFunc.get("Are you sure you want to exit realm $($)", "? ", apis.www.changeChat(id)));
                if(conf){
                    socket.emit("realm.exit", id);
                    coreFunc.changeChat("main");
                }
            break;
            case "mute":
                const realm = vars.realms.find(g => g.realm == id);
                if(!realm) return;

                let muted = false;
                let endTime;
                if(realm.muted != undefined){
                    if(realm.muted == -1){
                        muted = false;
                    }else if(realm.muted == 0){
                        muted = true;
                    }else if(realm.muted > new Date().getTime()){
                        muted = true;
                        endTime = new Date(realm.muted).toLocaleString();
                    }else{
                        muted = false;
                    }
                }

                const muteStatus = muted ? translateFunc.get("muted") : translateFunc.get("unmuted");
                let endTimeText = '';

                if(muted){
                    if(realm.muted === 0){
                        endTimeText = translateFunc.get("Mute is permanent");
                    }else if(realm.muted > new Date().getTime()){
                        const endTime = new Date(realm.muted).toLocaleString();
                        endTimeText = translateFunc.get("Mute ends at $", endTime);
                    }
                }

                const text = `
                    ${translateFunc.get("Mute realm ($)", apis.www.changeChat(id))}
                    <br />
                    ${translateFunc.get("Status")}: ${muteStatus}
                    ${endTimeText ? "<br />" + endTimeText : ''}
                `;

                uiFunc.selectPrompt(
                    text,
                    [
                        translateFunc.get("15 minutes"),
                        translateFunc.get("1 hour"),
                        translateFunc.get("1 day"),
                        translateFunc.get("Permanently"),
                        translateFunc.get("Unmute"),
                        translateFunc.get("Cancel")
                    ],
                    ["15m", "1h", "1d", "forever", "unmute", "cancel"]
                ).then(value => {
                    if (!value) return;

                    const now = new Date();
                    let targetTime = -1;
                    switch (value) {
                        case "15m":
                            now.setMinutes(now.getMinutes() + 15);
                            targetTime = now.getTime();
                        break;
                        case "1h":
                            now.setHours(now.getHours() + 1);
                            targetTime = now.getTime();
                        break;
                        case "1d":
                            now.setDate(now.getDate() + 1);
                            targetTime = now.getTime();
                        break;
                        case "forever":
                            targetTime = 0;
                        break;
                        case "unmute":
                            targetTime = -1;
                        break;
                        case "cancel":
                            return;
                    }

                    socket.emit("realm.mute", id, targetTime);
                    realm.muted = targetTime;
                });
            break;
            default:
                const n: never = type;
                console.error(n);
        }
    },

    channel(type: Context__channel){
        const id = document.querySelector("#channel_context_menu").getAttribute("_id");
        switch(type){
            case "copy_id":
                utils.writeToClipboard(id).then(ok => {
                    if(ok) uiFunc.uiMsg(translateFunc.get("Copied channel ID") + "!");
                });
            break;
            case "subscribe":
                subscribeEventChnl.show(vars.chat.to, id);
            break;
            case "create_thread":
                uiInteract.createThread();
            break;
            default:
                const n: never = type;
                console.error(n);
        }
    },

    thread(type: Context__thread){
        const id = document.querySelector("#thread_context_menu").getAttribute("_id");
        switch(type){
            case "copy_id":
                utils.writeToClipboard(id).then(ok => {
                    if(ok) uiFunc.uiMsg(translateFunc.get("Copied thread ID") + "!");
                });
            break;
            case "delete":
                const conf = confirm(translateFunc.get("Are you sure you want to delete this thread?"));
                if(!conf) return;

                const thread = vars.realm.threads.find(t => t._id == id);
                if(!thread) return;

                if(vars.user._id !== thread.author && !permissionFunc.isAdmin()) return;
                socket.emit("realm.thread.delete", vars.chat.to, id);

                document.querySelector("#channel_\\&"+thread._id)?.remove();
                document.querySelector("#thread__"+thread._id)?.remove();
                if(vars.chat.chnl == "&"+thread._id){
                    coreFunc.changeChnl(thread.thread);
                }
            break;
            default:
                const n: never = type;
                console.error(n);
        }
    }
}

mglInt.contextFunc = contextFunc;
export default contextFunc;