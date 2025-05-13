import apis from "#apis";
import globalExpose from "#bus";
import modalView from "#components/app/modal.view";
import { changeToChannel } from "#features/mess";
import socket from "#socket/socket";
import { $store } from "#store";
import { Context__channel, Context__message, Context__realm, Context__thread } from "#types/context";
import uiFunc from "#uiFunc";
import permissionFunc from "#utils/perm";
import LangPkg, { langFunc } from "#utils/translate";
import utils from "#utils/utils";

const contextFunc = {
    message(type: Context__message) {
        const id = document.querySelector("#message_context_menu").getAttribute("_id");
        switch (type) {
            case "copy":
                const message = document.querySelector("#mess__" + id + " .mess_content").getAttribute("_plain");
                utils.writeToClipboard(message).then(ok => {
                    if (ok) uiFunc.uiMsgT(LangPkg.ui.copied);
                });
                break;
            case "edit":
                // uiInteract.editMess(id);
                break;
            case "delete":
                // uiInteract.deleteMess(id);
                break;
            case "reply":
                // vars.temp.replyId = id;
                // messHTML.replyClose.style.display = "block";
                // (document.querySelector("#mess__" + id) as HTMLElement).style.backgroundColor = "var(--panel)";
                break;
            case "copy_id":
                utils.writeToClipboard(id).then(ok => {
                    if (ok) uiFunc.uiMsgT(LangPkg.ui.copied);
                })
                break;
            case "add_reaction":
                const chnl = $store.chat.chnl.get();
                if (chnl) {
                    if (!$store.realm.chnlPerm.get()?.[chnl]?.react) return uiFunc.uiMsgT(LangPkg.ui.message.no_react, ["!"]);
                }
                // messInteract.emocjiPopup((e) => {
                //     if (!e) return;
                //     socket.emit("message.react", $store.chat.id.get(), id, e);
                // });
                break;
            case "pin":
            case "unpin":
                socket.emit("message.pin", $store.chat.id.get(), $store.chat.chnl.get(), id, type === "pin");
                break;
            case "create_thread":
                if(!$store.realm.chnlPerm.get()?.[$store.chat.chnl.get()]?.threadCreate) return;
                modalView.show("createThread", {
                    messId: id,
                });
                break;
            default:
                const n: never = type;
                console.error(n);
        }
    },

    async realm(type: Context__realm) {
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
                const conf = await uiFunc.confirm(langFunc(LangPkg.ui.confirm.exit_realm, apis.www.changeChat(id)) + "?");
                if (conf) {
                    socket.emit("realm.exit", id);
                    $store.chat.id.set("main");
                }
                break;
            case "mute":
                const realm = $store.realms.get().find(g => g.realm == id);
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
                // subscribeEventChnl.show(vars.chat.to, id);
                break;
            case "create_thread":
                if(!$store.realm.chnlPerm.get()?.[id]?.threadCreate) return;
                modalView.show("createThread", {
                    chnl: id,
                });
                break;
            default:
                const n: never = type;
                console.error(n);
        }
    },

    async thread(type: Context__thread) {
        const id = document.querySelector("#thread_context_menu").getAttribute("_id");
        switch (type) {
            case "copy_id":
                utils.writeToClipboard(id).then(ok => {
                    if (ok) uiFunc.uiMsgT(LangPkg.ui.copied);
                });
                break;
            case "delete":
                const conf = await uiFunc.confirm(LangPkg.ui.confirm.delete_thread + "?");
                if (!conf) return;

                const thread = $store.realm.threads.get().find(t => t._id == id);
                if (!thread) return;

                if ($store.user._id.get() !== thread.author && !permissionFunc.isAdmin()) return;
                socket.emit("realm.thread.delete", $store.chat.id.get(), id);

                document.querySelector("#channel_\\&" + thread._id)?.remove();
                document.querySelector("#thread__" + thread._id)?.remove();
                if ($store.chat.chnl.get() == "&" + thread._id) {
                    changeToChannel(thread.thread);
                }
                break;
            default:
                const n: never = type;
                console.error(n);
        }
    }
}

export default contextFunc;
globalExpose("ui", "context", contextFunc);