import hub from "../../hub.js";
hub("interact/context");
import uiInteract from "./ui.js";
import vars from "../../var/var.js";
import apis from "../../api/apis.js";
import utils from "../../utils/utils.js";
import uiFunc from "../helpers/uiFunc.js";
import coreFunc from "../../core/coreFunc.js";
import socket from "../../core/socket/socket.js";
import permissionFunc from "../../utils/perm.js";
import { messHTML } from "../../var/html.js";
import { mglInt } from "../../var/mgl.js";
import messInteract from "../../core/mess/interact.js";
import subscribeEventChnl from "../interact/subscribeEventChnl.js";
import LangPkg, { langFunc } from "../../utils/translate.js";
const contextFunc = {
    message(type) {
        const id = document.querySelector("#message_context_menu").getAttribute("_id");
        switch (type) {
            case "copy":
                const message = document.querySelector("#mess__" + id + " .mess_content").getAttribute("_plain");
                utils.writeToClipboard(message).then(ok => {
                    if (ok)
                        uiFunc.uiMsgT(LangPkg.ui.copied);
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
                document.querySelector("#mess__" + id).style.backgroundColor = "var(--panel)";
                break;
            case "copy_id":
                utils.writeToClipboard(id).then(ok => {
                    if (ok)
                        uiFunc.uiMsgT(LangPkg.ui.copied);
                });
                break;
            case "add_reaction":
                const chnl = vars.chat.chnl;
                if (chnl) {
                    if (!vars.realm.chnlPerms[chnl].react)
                        return uiFunc.uiMsgT(LangPkg.ui.message.no_react, ["!"]);
                }
                messInteract.emocjiPopup((e) => {
                    if (!e)
                        return;
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
                const n = type;
                console.error(n);
        }
    },
    async realm(type) {
        const id = document.querySelector("#realm_context_menu").getAttribute("_id");
        switch (type) {
            case "copy_id":
                utils.writeToClipboard(id).then(ok => {
                    if (ok)
                        uiFunc.uiMsgT(LangPkg.ui.copied);
                });
                break;
            case "copy_invite":
                const link = location.protocol + "//" + location.host + "/ir?id=" + id;
                utils.writeToClipboard(link).then(ok => {
                    if (ok)
                        uiFunc.uiMsgT(LangPkg.ui.copied);
                });
                break;
            case "exit":
                const conf = await uiFunc.confirm(langFunc(LangPkg.ui.confirm.exit_realm, apis.www.changeChat(id)) + "?");
                if (conf) {
                    socket.emit("realm.exit", id);
                    coreFunc.changeChat("main");
                }
                break;
            case "mute":
                const realm = vars.realms.find(g => g.realm == id);
                if (!realm)
                    return;
                let muted = false;
                let endTime;
                if (realm.muted != undefined) {
                    if (realm.muted == -1) {
                        muted = false;
                    }
                    else if (realm.muted == 0) {
                        muted = true;
                    }
                    else if (realm.muted > new Date().getTime()) {
                        muted = true;
                        endTime = new Date(realm.muted).toLocaleString();
                    }
                    else {
                        muted = false;
                    }
                }
                const muteStatus = muted ? LangPkg.ui.muted : LangPkg.ui.unmuted;
                let endTimeText = '';
                if (muted) {
                    if (realm.muted === 0) {
                        endTimeText = LangPkg.ui.mute.is_permanent;
                    }
                    else if (realm.muted > new Date().getTime()) {
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
                uiFunc.selectPrompt(text, [
                    durations.minutes15,
                    durations.hour1,
                    durations.day1,
                    durations.permanently,
                    LangPkg.ui.mute.unmute,
                    LangPkg.uni.cancel
                ]).then(value => {
                    if (!value)
                        return;
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
                socket.emit("realm.settings.get", id);
                break;
            default:
                const n = type;
                console.error(n);
        }
    },
    channel(type) {
        const id = document.querySelector("#channel_context_menu").getAttribute("_id");
        switch (type) {
            case "copy_id":
                utils.writeToClipboard(id).then(ok => {
                    if (ok)
                        uiFunc.uiMsgT(LangPkg.ui.copied);
                });
                break;
            case "subscribe":
                subscribeEventChnl.show(vars.chat.to, id);
                break;
            case "create_thread":
                uiInteract.createThread();
                break;
            default:
                const n = type;
                console.error(n);
        }
    },
    async thread(type) {
        const id = document.querySelector("#thread_context_menu").getAttribute("_id");
        switch (type) {
            case "copy_id":
                utils.writeToClipboard(id).then(ok => {
                    if (ok)
                        uiFunc.uiMsgT(LangPkg.ui.copied);
                });
                break;
            case "delete":
                const conf = await uiFunc.confirm(LangPkg.ui.confirm.delete_thread + "?");
                if (!conf)
                    return;
                const thread = vars.realm.threads.find(t => t._id == id);
                if (!thread)
                    return;
                if (vars.user._id !== thread.author && !permissionFunc.isAdmin())
                    return;
                socket.emit("realm.thread.delete", vars.chat.to, id);
                document.querySelector("#channel_\\&" + thread._id)?.remove();
                document.querySelector("#thread__" + thread._id)?.remove();
                if (vars.chat.chnl == "&" + thread._id) {
                    coreFunc.changeChnl(thread.thread);
                }
                break;
            default:
                const n = type;
                console.error(n);
        }
    }
};
mglInt.contextFunc = contextFunc;
export default contextFunc;
//# sourceMappingURL=context.js.map