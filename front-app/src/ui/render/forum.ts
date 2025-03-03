import apis from "../../api/apis";
import coreFunc from "../../core/coreFunc";
import { realm_thread_list } from "../../core/socket/logic/mess";
import socket from "../../core/socket/socket";
import Id from "../../types/Id";
import { Vars_realm__thread } from "../../types/var";
import LangPkg from "../../utils/translate";
import { messHTML } from "../../var/html";
import vars from "../../var/var";
import uiFunc from "../helpers/uiFunc";

export default function render_forum(forums: Vars_realm__thread[], chnlId: Id) {
    const container = document.createElement("div");

    const addBtn = document.createElement("button");
    addBtn.classList.add("btn");
    addBtn.id = "forum_add";
    addBtn.innerHTML = LangPkg.ui.create_thread;
    addBtn.addEventListener("click", async () => {
        const name = await uiFunc.prompt(LangPkg.ui.create_thread_name);
        if (!name) return;
        socket.emit("realm.thread.create", vars.chat.to, chnlId, name, null, (id: Id) => {
            coreFunc.changeChnl("&" + id);
        });
    });
    container.appendChild(addBtn);
    container.appendChild(document.createElement("hr"));
    container.appendChild(document.createElement("br"));

    forums.forEach(forum => {
        const div = document.createElement("div");
        div.classList.add("forum");
        div.id = "forum__" + forum._id;
        div.innerHTML = `
            <div class="forum__author">${apis.www.changeUserID(forum.author)}</div>
            <div class="forum__name">${forum.name}</div>
        `;
        container.appendChild(div);
        div.addEventListener("click", () => {
            realm_thread_list([forum]);
            coreFunc.changeChnl("&" + forum._id);
        });
    });
    messHTML.div.appendChild(container);
}