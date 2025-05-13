import navRealmsView from "#components/app/navRealm.view";
import contextMenu from "#components/modal/contextMenu";
import { changeToChannel } from "#features/mess";
import uiFunc from "#helpers/uiFunc";
import socket from "#socket/socket";
import { $store } from "#store";
import { Id } from "#types/base";
import { Channel_Type } from "#types/channel";
import { Ui_render__category, Ui_render__channel } from "#types/ui/render";
import { Vars_realm__chnlPerm } from "#types/var";

function createRealmNameSection(name: string, sid: Id) {
    navRealmsView.realm__name.innerHTML = "";

    const nameText = document.createElement("div");
    nameText.innerHTML = name;
    nameText.title = name;
    nameText.id = "navs__realm__name__text";
    navRealmsView.realm__name.appendChild(nameText);

    addUsersDisplayButton();
    addMenuButton(sid);
}

function addUsersDisplayButton() {
    const usersDisplayBtn = document.createElement("span");
    usersDisplayBtn.innerHTML = "👥";
    usersDisplayBtn.classList.add("realm_nav_btn");
    usersDisplayBtn.addEventListener("click", () => {
        $store.ui.navs.realmUserOpen.set(!$store.ui.navs.realmUserOpen.get());
    });
    navRealmsView.realm__name.appendChild(usersDisplayBtn);
}

function addMenuButton(sid: Id) {
    const menuBtn = document.createElement("span");
    menuBtn.classList.add("realm_nav_btn");
    menuBtn.innerHTML = "⬇️";
    menuBtn.addEventListener("click", (e) => {
        setTimeout(() => {
            contextMenu.realm(e, sid);
        }, 20); // wait for click event end
    });
    navRealmsView.realm__name.appendChild(menuBtn);
}

function createChannel(channel: Ui_render__channel, root: HTMLElement, sid: Id) {
    const { name, type, id: cid } = channel;
    const btn = document.createElement("div");

    btn.onclick = () => handleChannelClick(type, cid, sid);
    btn.id = "channel_" + cid;
    btn.classList.add("channel_" + type);

    contextMenu.menuClickEvent(btn, (e) => {
        contextMenu.channel(e, cid, { type });
    });

    const typeEmoticon = getChannelTypeEmoticon(type);
    btn.innerHTML = `${typeEmoticon} | ${name}`;
    root.appendChild(btn);
}

export function getChannelTypeEmoticon(type: Channel_Type) {
    switch (type) {
        case "text": return "📝";
        // case "voice": return "🎤";
        case "announcement": return "📣";
        case "open_announcement": return "📣";
        case "forum": return "📜";
        default:
            const n: never = type;
            console.error(n);
    }
}

function handleChannelClick(type: Channel_Type, cid: Id, sid: Id) {
    if (type === "text" || type === "announcement" || type === "open_announcement") {
        changeToChannel(cid);
    } else if (type === "forum") {
        // coreFunc.changeToForum(cid);
    }
}

function createCategory(category: Ui_render__category, root: HTMLElement, sid: Id) {
    const detail = document.createElement("details");
    detail.open = true;

    const summary = document.createElement("summary");
    summary.innerHTML = category.name;
    detail.appendChild(summary);

    category.chnls.forEach(channel => {
        createChannel(channel, detail, sid);
    });

    root.appendChild(detail);
}

function findFirstTextChannel(categories: Ui_render__category[]) {
    for (const cat of categories) {
        const textChannel = cat.chnls.find(chnl => chnl.type === "text");
        if (textChannel) return textChannel.id;
    }
    return null;
}

function downPanel() {
    const downPanel = navRealmsView.realm__panel;
    downPanel.innerHTML = "";
    downPanel_events(downPanel);

}

function downPanel_events(panel: HTMLElement) {
    const events = document.createElement("button");
    events.innerHTML = "🪇";
    events.title = "Events";
    events.id = "navs__realm__events";
    events.clA("btn");
    // events.addEventListener("click", render_events.show);
    panel.appendChild(events);

    setTimeout(() => {
        socket.emit("realm.event.list", $store.chat.id.get(), true, (len: number) => {
            events.setAttribute("data-count", len.toString());
        });
    }, 100);
}

async function realmInit(sid: Id, name: string, categories: Ui_render__category[]) {
    createRealmNameSection(name, sid);
    const chnlRef = $store.chat.chnl;

    navRealmsView.realm__channels.innerHTML = "";
    if (categories.length === 0 || categories.every(category => category.chnls.length === 0)) {
        navRealmsView.realm__channels.innerHTML = "No channels in this realm";
        chnlRef.set(null);
        return;
    }

    categories.forEach(category => createCategory(category, navRealmsView.realm__channels, sid));

    const chnlPerms: { [id: Id]: Vars_realm__chnlPerm; } = {};
    const descriptions: { [id: Id]: string } = {};

    categories.forEach(category => {
        category.chnls.forEach(channel => {
            const { id, perms, desc } = channel;
            chnlPerms[id] = perms;
            descriptions[id] = desc;
        });
    });
    $store.realm.chnlPerm.set(chnlPerms);
    $store.realm.descriptions.set(descriptions);

    downPanel();

    if (chnlRef.get() === null || chnlRef.get() === "main")
        chnlRef.set(findFirstTextChannel(categories));

    // socketEvt["realm.thread.list"].emitId(sid + "=null", sid, null);
}

export default realmInit;