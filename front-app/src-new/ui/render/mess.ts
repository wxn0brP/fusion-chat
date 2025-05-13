import apis from "#apis";
import contextMenu from "#components/modal/contextMenu";
import messStyle from "#components/style/mess";
import socket from "#socket";
import { $store } from "#store";
import { Core_mess__dbMessage } from "#types/core/mess";
import permissionFunc, { PermissionFlags } from "#utils/perm";
import utils from "#utils/utils";
import formatFunc from "#features/mess/format";
import { format_embed } from "#features/mess/format/embed";
import staticData from "#core/staticData";

export const editMessText = `<span class="editMessText noneselect" title="edit $$">(edit)</span>`;

export function createMess(data: Core_mess__dbMessage) {
    if (!data) return;

    const messDiv = createMessageDiv(data);
    const fromDiv = createAuthorDiv(data);
    const messContentDiv = createContentDiv(data);

    messDiv.appendChild(fromDiv);
    messDiv.appendChild(messContentDiv);

    if (data.reacts) {
        const reactsDiv = createReactsDiv(data);
        messDiv.appendChild(reactsDiv);
    }

    addContextMenu(messDiv, data);
    addSelectOnClick(messDiv, data);

    return messDiv;
}

function createMessageDiv(data: Core_mess__dbMessage) {
    const messDiv = document.createElement("div");
    messDiv.classList.add("mess_message");
    messDiv.id = `mess__${data._id}`;
    if (data.res) messDiv.setAttribute("resMsgID", data.res);
    return messDiv;
}

function createAuthorDiv(data: Core_mess__dbMessage) {
    const fromDiv = document.createElement("div");
    fromDiv.classList.add("mess_meta");
    fromDiv.setAttribute("_author", data.fr);

    const fromDivImg = document.createElement("img");
    fromDivImg.src = `/api/profile/img?id=${data.fr}`;
    fromDiv.appendChild(fromDivImg);

    const fromDivText = document.createElement("div");
    fromDivText.classList.add("mess_meta_text");

    const fromDivTextName = createAuthorName(data);
    fromDivText.appendChild(fromDivTextName);

    const timeDiv = createTimeDiv(data);
    fromDivText.appendChild(timeDiv);

    fromDiv.appendChild(fromDivText);
    return fromDiv;
}

function createAuthorName(data: Core_mess__dbMessage) {
    const fromDivTextName = document.createElement("span");
    fromDivTextName.innerHTML = apis.www.changeUserID(data.fr);
    fromDivTextName.classList.add("mess_author_name");
    if (!["%", "^", "("].includes(data.fr[0])) { // if not system/api
        fromDivTextName.addEventListener("click", () => {
            // socket.emit("user.profile", data.fr);
            alert("TODO /helper/mess/createAuthorName :79");
        });
    }
    return fromDivTextName;
}

function createTimeDiv(data: Core_mess__dbMessage) {
    const timeDiv = document.createElement("span");
    timeDiv.classList.add("mess_time");
    timeDiv.innerHTML = utils.formatDateFormUnix(utils.extractTimeFromId(data._id));
    return timeDiv;
}

function createContentDiv(data: Core_mess__dbMessage) {
    const messContentDiv = document.createElement("div");
    messContentDiv.classList.add("mess_content");
    formatFunc.formatMess(data.msg, messContentDiv);
    messContentDiv.setAttribute("_plain", data.msg);

    if (data.lastEdit) {
        const replacer = utils.formatDateFormUnix(parseInt(data.lastEdit, 36) * 1000);
        messContentDiv.innerHTML += editMessText.replace("$$", replacer);
    }

    if (data.embed) format_embed(data.embed, messContentDiv);

    return messContentDiv;
}

function createReactsDiv(data: Core_mess__dbMessage) {
    const reactsDiv = document.createElement("div");
    reactsDiv.classList.add("mess_reacts");
    const reacts = data.reacts;

    Object.keys(reacts).forEach(key => {
        const users = reacts[key];
        const span = document.createElement("span");
        span.setAttribute("_key", key);
        span.setAttribute("_users", users.join(","));
        span.addEventListener("click", () => {
            socket.emit("message.react", $store.chat.id.get(), data._id, key);
        });
        reactsDiv.appendChild(span);
    });

    messStyle.styleMessReacts(reactsDiv);
    return reactsDiv;
}

export function isScrollAtBottom(messDiv: HTMLDivElement, messagesDiv: HTMLDivElement) {
    const errMargin = 70; // (px)
    const height = messagesDiv.scrollTop + messagesDiv.clientHeight + messDiv.clientHeight + errMargin;
    return height >= messagesDiv.scrollHeight;
}

function addContextMenu(messDiv: HTMLDivElement, data: Core_mess__dbMessage) {
    contextMenu.menuClickEvent(messDiv, (e) => {
        const isMessPinned = false //vars.chat.pinned.findIndex((m) => m._id === data._id) !== -1; // TODO
        const canDelete = data.fr === $store.user._id.get() || permissionFunc.canAction(PermissionFlags.ManageMessages);
        contextMenu.message(e, data._id, {
            pin: !isMessPinned,
            edit: data.fr === $store.user._id.get(),
            delete: canDelete
        });
    }, (target) => {
        return !staticData.contextmenuTags.includes(target.tagName.toLowerCase());
    });
}

function addSelectOnClick(messDiv: HTMLDivElement, data: Core_mess__dbMessage) {
    messDiv.addEventListener("click", () => {
        $store.ui.messages.selectedMess.set(data._id);
    });
}