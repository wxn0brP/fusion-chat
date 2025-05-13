import contextMenu from "#components/modal/contextMenu";
import { $store } from "#store";
import { UiComponent } from "#types/component";
import { Core_mess__dbMessage } from "#types/core/mess";
import { Vars_realm__thread } from "#types/var";
import { changeToChannel } from "#features/mess";
import { createMess, isScrollAtBottom } from "#components/render/mess";

export interface MessagesView_Append__Opts {
    scroll: boolean;
    up: boolean;
}

class MessagesView implements UiComponent {
    element: HTMLDivElement;
    nav: HTMLDivElement;
    nav__realm__description: HTMLDivElement;

    render(): void {}

    async append(messData: Core_mess__dbMessage, opts: Partial<MessagesView_Append__Opts> = {}) {
        const options: MessagesView_Append__Opts = {
            scroll: false,
            up: true,
            ...opts,
        }

        const messDiv = createMess(messData);

        options.up ? this.element.addUp(messDiv) : this.element.add(messDiv);

        setTimeout(() => {
            // if (messData.res) format_responeMess(messData.res, messDiv);

            if (options.scroll && isScrollAtBottom(messDiv, this.element)) {
                messDiv.scrollIntoView({ behavior: "smooth" });
            }
        }, 100);
    }

    clearMessages() {
        this.element.innerHTML = "";
    }

    setScrollToBottom() {
        this.element.scrollTop = this.element.scrollHeight;
        setTimeout(() => {
            this.element.scrollTop = this.element.scrollHeight;
        }, 50);
    }

    renderThreads(data: Vars_realm__thread[]) {
        data.forEach(t => {
            const chnlDiv = document.querySelector("#channel_" + t.thread);
            if (!chnlDiv) return;

            const exists = document.querySelector("#channel_\\&" + t._id);
            if (!exists) {
                const div = document.createElement("div");
                div.classList.add("channel_text");
                div.id = "channel_&" + t._id;
                div.style.paddingLeft = "2.4rem";
                div.innerHTML = `\`- ${t.name}`;
                div.addEventListener("click", () => {
                    changeToChannel("&" + t._id);
                });
                chnlDiv.insertAdjacentElement("afterend", div);
                contextMenu.menuClickEvent(div, (e) => {
                    contextMenu.thread(e, t);
                })
            }

            if (t.reply) {
                const mess = document.querySelector<HTMLDivElement>("#mess__" + t.reply);
                // if (mess) messInteract.thread(t, mess);
            }
        })
    }

    mount(): void {
        this.element = document.querySelector("#messages");
        this.nav = document.querySelector("#messages_nav");
        this.nav__realm__description = this.nav.querySelector("#messages_nav__realm__description");

        $store.ui.messages.open.subscribe((open) => {
            this.nav.style.display = this.element.style.display = open ? "" : "none";
        });

        $store.chat.chnl.subscribe((id) => {
            if (id === "main") return this.nav__realm__description.innerHTML = "";

            this.nav__realm__description.innerHTML = $store.realm.descriptions.get()?.[id] || "";
        });

        $store.realm.threads.subscribe((threads) => {
            this.renderThreads(threads);
        });
    }
}

const messagesView = new MessagesView();
export default messagesView;