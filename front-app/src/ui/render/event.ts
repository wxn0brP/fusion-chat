import apis from "../../api/apis";
import formatFunc from "../../core/mess/format";
import socket from "../../core/socket/socket";
import Id from "../../types/Id";
import { Ui_render__event } from "../../types/ui/render";
import permissionFunc from "../../utils/perm";
import LangPkg from "../../utils/translate";
import { navHTML, renderHTML } from "../../var/html";
import { mglInt } from "../../var/mgl";
import vars from "../../var/var";
import voiceFunc from "../components/voice";
import uiFunc from "../helpers/uiFunc";
import { getChannelTypeEmoticon } from "./realmInit";

const render_events = {
    show() {
        if (vars.chat.to == "main" || vars.chat.to.startsWith("$")) return;
        socket.emit("realm.event.list", vars.chat.to, false, (events: Ui_render__event[]) => {
            renderHTML.events__container.innerHTML = "";
            renderHTML.events__add.style.display = permissionFunc.isAdmin() ? "" : "none";
            events.forEach(render_events.renderEvent);
            renderHTML.events.fadeIn();
            navHTML.realm__panel.querySelector("#navs__realm__events").setAttribute("data-count", events.length.toString());
        });
    },

    renderEvent(event: Ui_render__event) {
        const { type, where, topic, time: timeShort, desc, img, _id, author } = event;
        const time = timeShort * 1000;
        const eventTime = new Date(time).getTime();

        const eventDiv = document.createElement("div");
        eventDiv.clA("realm_event");

        eventDiv.innerHTML += `
            <img src="${img || "/favicon.svg"}" />
            <div class="realm_event__info">
                <h2>${topic}</h2>
                ${desc ? `<div data-id="eventDesc"></div>` : ""}
                <p>${LangPkg.ui.author}: ${apis.www.changeUserID(author)}</p>
                <p>${new Date(time).toLocaleString()} (<span data-id="cutdown"></span>)</p>
            </div>
        `;
        const info = eventDiv.querySelector(".realm_event__info");

        if (desc) {
            const eventDesc = eventDiv.querySelector<HTMLDivElement>("[data-id='eventDesc']");
            formatFunc.formatMess(desc, eventDesc);
        }

        if (permissionFunc.isAdmin()) {
            const button = document.createElement("button");
            button.innerHTML = LangPkg.uni.delete;
            button.clA("btn");
            button.addEventListener("click", () => {
                socket.emit("realm.event.delete", vars.chat.to, _id);
                setTimeout(() => {
                    render_events.show();
                }, 100);
            });
            const div = document.createElement("div");
            div.appendChild(button);
            eventDiv.appendChild(div);
        }

        const cutdown = eventDiv.querySelector("[data-id='cutdown']");
        let interval;
        const updateCutdown = () => {
            const now = new Date().getTime();
            const diff = eventTime - now;

            if (diff <= 0) {
                cutdown.textContent = "0h 0m 0s";
                if (type == "custom") {
                    const div = document.createElement("div");
                    formatFunc.formatMess(where, div);
                    info.appendChild(div);
                } else if (type == "voice") {
                    const button = document.createElement("button");
                    button.innerHTML = LangPkg.ui.call.call;
                    button.clA("btn");
                    button.style.marginTop = "5px";
                    button.addEventListener("click", () => {
                        voiceFunc.joinToVoiceChannel(where);
                    });

                    info.appendChild(button);
                }
                clearInterval(interval);
            } else {
                const hours = Math.floor(diff / (1000 * 60 * 60));
                const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
                const seconds = Math.floor((diff % (1000 * 60)) / 1000);

                cutdown.textContent = `${hours}h ${minutes}m ${seconds}s`;
            }
        };

        if (new Date().getTime() < eventTime) {
            interval = setInterval(updateCutdown, 1000);
        }
        updateCutdown();

        renderHTML.events__container.appendChild(eventDiv);
    },

    exit() {
        renderHTML.events.fadeOut(() => {
            renderHTML.events__container.innerHTML = "";
        });
    },

    async create() {
        if (vars.chat.to == "main" || vars.chat.to.startsWith("$")) return;
        if (!permissionFunc.isAdmin()) return;

        const topic = await uiFunc.prompt(LangPkg.ui.event.topic);
        if (!topic) return;

        const time = await uiFunc.promptTime(LangPkg.ui.event.time, "datetime-local", Date.now() + 60_000);
        if (!time) return;
        const diff = new Date(time).getTime() - new Date().getTime();
        if (diff <= 60_000) return;

        const desc = await uiFunc.prompt(LangPkg.ui.event.desc);

        const type = await uiFunc.selectPrompt<"custom" | "voice">(
            LangPkg.ui.event.type,
            [LangPkg.ui.event.type_custom, LangPkg.ui.event.type_voice],
            ["custom", "voice"]
        );
        let where: Id | string;
        if (type == "custom") {
            where = await uiFunc.prompt(LangPkg.ui.event.where);
            if (!where) return;
        } else if (type == "voice") {
            const categories = [];
            const vc_ids = [];
            const vc_names = [];

            navHTML.realm__channels.querySelectorAll<HTMLDivElement>(".channel_voice:not(details .channel_voice)").forEach(chnl => {
                const id = chnl.id.replace("channel_", "");
                const name = chnl.textContent.replace(getChannelTypeEmoticon("voice") + " | ", "");
                vc_ids.push(id);
                vc_names.push(name);
            });

            navHTML.realm__channels.querySelectorAll<HTMLDetailsElement>("details").forEach(details => {
                const name = details.querySelector("summary").textContent;
                const category_ids = [];
                const category_names = [];
                details.querySelectorAll<HTMLDivElement>(".channel_voice").forEach(chnl => {
                    const id = chnl.id.replace("channel_", "");
                    const name = chnl.textContent.replace(getChannelTypeEmoticon("voice") + " | ", "");
                    category_ids.push(id);
                    category_names.push(name);
                });
                categories.push({ name, options: category_names, values: category_ids });
            });

            where = await uiFunc.selectPrompt(LangPkg.ui.event.type_voice, vc_names, vc_ids, categories);
            if (!where) return;
        }

        const img = await uiFunc.prompt(LangPkg.ui.event.img);

        const req = {
            topic,
            time: Math.floor(new Date(time).getTime() / 1000),
            desc,
            type,
            where,
            img,
        }

        socket.emit("realm.event.create", vars.chat.to, req);
        setTimeout(() => {
            render_events.show();
        }, 100);
    }
}

export default render_events;
mglInt.realmEvents = render_events;