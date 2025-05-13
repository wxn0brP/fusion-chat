import modalView from "#components/app/modal.view";
import { createModal } from "#components/render/modal";
import socket from "#socket/socket";
import LangPkg from "#utils/translate";

modalView.register("addDm", () => createModal({
    title: LangPkg.ui.add_dm,
    onSubmit: (to: string) => {
        if (!to) return;
        socket.emit("dm.create", to);
    }
}));

modalView.register("realm", () => (root: HTMLDivElement) => {
    root.innerHTML = `
        <p><button>${LangPkg.ui.create_realm}</button></p>
        <p><button>${LangPkg.ui.join_realm}</button></p>
        <p><button>${LangPkg.uni.cancel}</button></p>
    `;

    const buttons = root.querySelectorAll("button");
    buttons[0].onclick = () => modalView.show("createRealm");
    buttons[1].onclick = () => modalView.show("joinRealm");
    buttons[2].onclick = () => modalView.close();
});

modalView.register("createRealm", () => createModal({
    title: LangPkg.ui.create_realm,
    onSubmit: (name: string) => {
        if (!name) return;
        socket.emit("realm.create", name);
    }
}));

modalView.register("joinRealm", () => createModal({
    title: LangPkg.ui.join_realm,
    onSubmit: (id: string) => {
        if (!id) return;
        id = id
            .replace(location.protocol + "//", "")
            .replace(location.host, "")
            .replace("/ir?id=", "");
        socket.emit("realm.join", id);
    }
}));