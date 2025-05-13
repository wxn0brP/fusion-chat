import modalView from "#components/app/modal.view";
import { createModal } from "#components/render/modal";
import socket from "#socket/socket";
import { $store } from "#store";
import { Id } from "#types/base";
import { Vars_realm__thread } from "#types/var";
import LangPkg from "#utils/translate";

modalView.register("createThread", () => createModal({
    title: LangPkg.ui.create_thread_name,
    onSubmit(name: string, opts?: { messId: Id, chnl: Id }) {
        if (!name) return;

        const chnl = opts?.chnl || $store.chat.chnl.get();

        if(!$store.realm.chnlPerm.get()?.[chnl]?.threadCreate) return;

        const to = $store.chat.id.get();
        socket.emit(
            "realm.thread.create",
            to,
            chnl,
            name,
            opts?.messId || null,
            () => {
                socket.emit("realm.thread.list", to, chnl, (newThreads: Vars_realm__thread[]) => {
                    let threads = $store.realm.threads.get();
                    threads = [...new Set(threads.concat(newThreads))];
                    $store.realm.threads.set(threads);
                });
            }
        );
    },
}))