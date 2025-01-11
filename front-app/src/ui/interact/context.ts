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
import { messHTML, mglInt } from "../../var/html";
import messInteract from "../../core/mess/interact";
import subscribeEventChnl from "../interact/subscribeEventChnl";
import { Context__channel, Context__message, Context__realm, Context__thread } from "../../types/context";
import LangPkg, { langFunc } from "../../utils/translate";

const contextFunc = {
    message(type: Context__message) {
        const id = document.querySelector("#mesage_context_menu").getAttribute("_id");
        switch (type) {
            case "copy":
                const message = document.querySelector("#mess__" + id + " .mess_content").getAttribute("_plain");
                utils.writeToClipboard(message).then(ok => {
                    if (ok) uiFunc.uiMsgT(LangPkg.ui.copied);
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
                (document.querySelector("#mess__" + id) as HTMLElement).style.backgroundColor = "var(--panel)";
                break;
            case "copy_id":
                utils.writeToClipboard(id).then(ok => {
                    if (ok) uiFunc.uiMsgT(LangPkg.ui.copied);
                })
                break;
            case "add_reaction":
                const chnl = vars.chat.chnl;
                if (chnl) {
                    if (!vars.realm.chnlPerms[chnl].react) return uiFunc.uiMsgT(LangPkg.ui.message.no_react, ["!"]);
                }
                messInteract.emocjiPopup((e) => {
                    if (!e) return;
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

    realm(type: Context__realm) {
        const id = document.querySelector("#realm_context_menu").getAttribute("_id");
        switch (type) {
            case "copy_id":
                utils.writeToClipboard(id).then(ok => {
                    if (ok) uiFunc.uiMsgT(LangPkg.ui.copied);
                });
                break;
            case "copy_invite":
                // socket.emit("getInviteLink", id);
                const link = location.protocol + "//" + location.host + "/ir?id=" + id;
                utils.writeToClipboard(link).then(ok => {
                    if (ok) uiFunc.uiMsgT(LangPkg.ui.copied);
                });
                break;
            case "exit":
                const conf = confirm(langFunc(LangPkg.ui.confirm.exit_realm, apis.www.changeChat(id)) + "?");
                if (conf) {
                    socket.emit("realm.exit", id);
                    coreFunc.changeChat("main");
                }
                break;
            case "mute":
                const realm = vars.realms.find(g => g.realm == id);
                if (!realm) return;

                let muted = false;
                let endTime: string;
                if (realm.muted != undefined) {
                    if (realm.muted == -1) {
                        muted = false;
                    } else if (realm.muted == 0) {
                        muted = true;
                    } else if (realm.muted > new Date().getTime()) {
                        muted = true;
                        endTime = new Date(realm.muted).toLocaleString();
                    } else {
                        muted = false;
                    }
                }

                const muteStatus = muted ? LangPkg.ui.muted : LangPkg.ui.unmuted;
                let endTimeText = '';

                if (muted) {
                    if (realm.muted === 0) {
                        endTimeText = LangPkg.ui.mute.is_permanent;
                    } else if (realm.muted > new Date().getTime()) {
                        const endTime = new Date(realm.muted).toLocaleString();
                        endTimeText = langFunc(LangPkg.ui.mute.ends_at, endTime);
                    }
                }

                const text = `
                    ${langFunc(LangPkg.ui.mute.realm, apis.www.changeChat(id))}
                    <br />
                    ${LangPkg.ui.status}: ${muteStatus}
                    ${endTimeText ? "<br />" + endTimeText : ''}
                `;

                const durations = LangPkg.ui.durations;
                uiFunc.selectPrompt(
                    text,
                    [
                        durations.minutes15,
                        durations.hour1,
                        durations.day1,
                        durations.permanently,
                        LangPkg.ui.mute.unmute,
                        LangPkg.uni.cancel
                    ],
                ).then(value => {
                    if (!value) return;

                    const now = new Date();
                    let targetTime = -1;
                    switch (value) {
                        case durations.minutes15:
                            now.setMinutes(now.getMinutes() + 15);
                            targetTime = now.getTime();
                            break;
                        case durations.hour1:
                            now.setHours(now.getHours() + 1);
                            targetTime = now.getTime();
                            break;
                        case durations.day1:
                            now.setDate(now.getDate() + 1);
                            targetTime = now.getTime();
                            break;
                        case durations.permanently:
                            targetTime = 0;
                            break;
                        case LangPkg.ui.mute.unmute:
                            targetTime = -1;
                            break;
                        case LangPkg.uni.cancel:
                            return;
                    }

                    socket.emit("realm.mute", id, targetTime);
                    realm.muted = targetTime;
                });
                break;
            case "settings":
                socket.emit("realm.settings.get", id)
                break;
            default:
                const n: never = type;
                console.error(n);
        }
    },

    channel(type: Context__channel) {
        const id = document.querySelector("#channel_context_menu").getAttribute("_id");
        switch (type) {
            case "copy_id":
                utils.writeToClipboard(id).then(ok => {
                    if (ok) uiFunc.uiMsgT(LangPkg.ui.copied);
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

    thread(type: Context__thread) {
        const id = document.querySelector("#thread_context_menu").getAttribute("_id");
        switch (type) {
            case "copy_id":
                utils.writeToClipboard(id).then(ok => {
                    if (ok) uiFunc.uiMsgT(LangPkg.ui.copied);
                });
                break;
            case "delete":
                const conf = confirm(LangPkg.ui.confirm.delete_thread + "?");
                if (!conf) return;

                const thread = vars.realm.threads.find(t => t._id == id);
                if (!thread) return;

                if (vars.user._id !== thread.author && !permissionFunc.isAdmin()) return;
                socket.emit("realm.thread.delete", vars.chat.to, id);

                document.querySelector("#channel_\\&" + thread._id)?.remove();
                document.querySelector("#thread__" + thread._id)?.remove();
                if (vars.chat.chnl == "&" + thread._id) {
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
