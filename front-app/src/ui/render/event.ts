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

        const container = renderHTML.events__container;
        container.innerHTML = "";

        function createLabel(text: string, forId: string) {
            const label = document.createElement("label");
            label.textContent = text;
            label.htmlFor = forId;
            label.style.marginRight = "1rem";
            container.appendChild(label);
            container.appendChild(document.createElement("br"));
        }

        function br() {
            container.appendChild(document.createElement("br"));
            container.appendChild(document.createElement("br"));
        }

        createLabel(LangPkg.ui.event.topic, "event-topic");
        const topic = document.createElement("input");
        topic.type = "text";
        topic.placeholder = LangPkg.ui.event.topic;
        topic.id = "event-topic";
        container.appendChild(topic);
        br();

        createLabel(LangPkg.ui.event.time, "event-time");
        const time = document.createElement("input");
        time.type = "datetime-local";
        time.id = "event-time";
        container.appendChild(time);
        br();

        createLabel(LangPkg.ui.event.desc, "event-desc");
        const desc = document.createElement("input");
        desc.type = "text";
        desc.placeholder = LangPkg.ui.event.desc;
        desc.id = "event-desc";
        container.appendChild(desc);
        br();

        createLabel(LangPkg.ui.event.type, "event-type");
        const type = document.createElement("select");
        type.id = "event-type";
        [
            {
                name: LangPkg.ui.event.type_custom,
                type: "custom",
            },
            {
                name: LangPkg.ui.event.type_voice,
                type: "voice",
            }
        ].forEach(t => {
            const option = document.createElement("option");
            option.value = t.type;
            option.textContent = t.name;
            type.appendChild(option);
        });
        type.addEventListener("change", whereRender);
        container.appendChild(type);
        br();

        createLabel(LangPkg.ui.event.where, "event-where");
        const where = document.createElement("div");
        container.appendChild(where);
        br();

        const whereOptions = document.createElement("select");
        whereOptions.id = "event-where";
        renderWhereOptions();

        function whereRender() {
            where.innerHTML = "";
            if (type.value == "custom") {
                const input = document.createElement("input");
                input.type = "text";
                input.placeholder = LangPkg.ui.event.where;
                input.id = "event-where";
                where.appendChild(input);
            } else if (type.value == "voice") {
                where.appendChild(whereOptions);
            }
        }

        function renderWhereOptions() {
            navHTML.realm__channels.querySelectorAll<HTMLDivElement>(".channel_voice:not(details .channel_voice)").forEach(chnl => {
                const id = chnl.id.replace("channel_", "");
                const name = chnl.textContent.replace(getChannelTypeEmoticon("voice") + " | ", "");
                const option = document.createElement("option");
                option.value = id;
                option.textContent = name;
                whereOptions.appendChild(option);
            });

            navHTML.realm__channels.querySelectorAll<HTMLDetailsElement>("details").forEach(details => {
                const name = details.querySelector("summary").textContent;
                const category = document.createElement("optgroup");
                category.label = name;
                whereOptions.appendChild(category);

                details.querySelectorAll<HTMLDivElement>(".channel_voice").forEach(chnl => {
                    const id = chnl.id.replace("channel_", "");
                    const name = chnl.textContent.replace(getChannelTypeEmoticon("voice") + " | ", "");
                    const option = document.createElement("option");
                    option.value = id;
                    option.textContent = name;
                    category.appendChild(option);
                });
            });
        }

        whereRender();

        createLabel(LangPkg.ui.event.img, "event-img");
        const img = document.createElement("input");
        img.type = "text";
        img.placeholder = LangPkg.ui.event.img;
        img.id = "event-img";
        container.appendChild(img);
        br();

        const submit = document.createElement("button");
        submit.textContent = LangPkg.uni.add;
        submit.clA("btn");
        submit.addEventListener("click", () => {
            const req = {
                topic: topic.value,
                time: Math.floor(new Date(time.value).getTime() / 1000),
                desc: desc.value,
                type: type.value,
                where: where.querySelector<HTMLSelectElement | HTMLInputElement>("select, input").value,
                img: img.value,
            }
            socket.emit("realm.event.create", vars.chat.to, req);
            setTimeout(() => {
                render_events.show();
            }, 100)
        });
        container.appendChild(submit);
        br();
    }
}

export default render_events;
mglInt.realmEvents = render_events;