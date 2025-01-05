import hub from "../../../hub";
hub("rs/channels");

import rs_dataF from "./rs_var";
import apis from "../../../api/apis";
import genId from "../../../utils/genId";
import uiFunc from "../../helpers/uiFunc";
import debugFunc from "../../../core/debug";
import socket from "../../../core/socket/socket";
import translateFunc from "../../../utils/translate";
import { Settings_rs__Category, Settings_rs__Channel, Settings_rs__Role } from "./types";
import { Channel_Type } from "../../../types/channel";
import {
    initInputText,
    initButton,
    addSeparator,
    initCheckbox,
} from "./rs_utils";

export const renderChannels = function () {
    const rs_data = rs_dataF();
    const settings = rs_data.settings;
    if (!settings || !settings.categories || !settings.channels) return debugFunc.msg("No settings data");

    const categoriesContainer = rs_data.html.category;
    categoriesContainer.innerHTML = `<h1>${translateFunc.get("Categories & Channels")}</h1>`;

    const sortedCategories = settings.categories.sort((a, b) => a.i - b.i);
    const channels = settings.channels;

    initButton(categoriesContainer, translateFunc.get("Add category"), async () => {
        const name = await uiFunc.prompt("Name");

        settings.categories.push({
            cid: genId(),
            name: name || "New Category",
            i: settings.categories.length
        });
        renderChannels();
    })

    sortedCategories.forEach(category => {
        addSeparator(categoriesContainer, 15);
        const categoryDiv = document.createElement("div");
        categoryDiv.innerHTML = `<span style="font-size: 1.5rem" class="settings__nameSpan">- ${category.name}</span>`;

        initButton(categoryDiv, translateFunc.get("Move up"), () => {
            if (category.i === 0) return;

            const i = category.i;
            settings.categories[i].i = i - 1;
            settings.categories[i - 1].i = i;
            renderChannels();
        });

        initButton(categoryDiv, translateFunc.get("Move down"), () => {
            if (category.i === sortedCategories.length - 1) return;

            const i = category.i;
            settings.categories[i].i = i + 1;
            settings.categories[i + 1].i = i;
            renderChannels();
        });

        initButton(categoryDiv, translateFunc.get("Edit"), () => {
            categoriesContainer.querySelectorAll("div").forEach(div => div.style.border = "");
            categoryDiv.style.border = "3px dotted var(--accent)";
            renderEditCategory(category);
        });

        initButton(categoryDiv, translateFunc.get("Add channel"), async () => {
            const name = await uiFunc.prompt(translateFunc.get("Enter name"));
            const type = await uiFunc.selectPrompt(
                translateFunc.get("Enter type"),
                [translateFunc.get("Text"), translateFunc.get("Voice"), translateFunc.get("Realm Event"), translateFunc.get("Open Event")],
                ["text", "voice", "realm_event", "open_event"]
            ) as Channel_Type;

            const newChannel: Settings_rs__Channel = {
                name: name || "New Channel",
                type: type || "text",
                category: category.cid,
                i: channels.filter(channel => channel.category === category.cid).length,
                rp: [],
                chid: genId(),
                desc: ""
            };
            settings.channels.push(newChannel);
            renderChannels();
        });

        addSeparator(categoryDiv, 10);

        const categoryChannels = channels.filter(channel => channel.category === category.cid).sort((a, b) => a.i - b.i);
        categoryChannels.forEach(channel => {
            const channelElement = document.createElement("div");
            channelElement.innerHTML =
                `<span style="font-size: 1.2rem" class="settings__nameSpan">${"&nbsp;".repeat(3)}+ ${channel.name} (${channel.type})</span>`;

            initButton(channelElement, translateFunc.get("Move up"), () => {
                if (channel.i === 0) return;

                const i = channel.i;

                const currentChannelIndex = settings.channels.findIndex(ch => {
                    if (ch.category !== channel.category) return false;
                    return ch.i === i;
                });
                const previousChannelIndex = settings.channels.findIndex(ch => {
                    if (ch.category !== channel.category) return false;
                    return ch.i === i - 1;
                });

                if (currentChannelIndex === -1 || previousChannelIndex === -1) return;
                settings.channels[currentChannelIndex].i = i - 1;
                settings.channels[previousChannelIndex].i = i;

                renderChannels();
            });

            initButton(channelElement, translateFunc.get("Move down"), () => {
                if (channel.i >= categoryChannels.length - 1) return;

                const i = channel.i;

                const currentChannelIndex = settings.channels.findIndex(ch => {
                    if (ch.category !== channel.category) return false;
                    return ch.i === i;
                });
                const nextChannelIndex = settings.channels.findIndex(ch => {
                    if (ch.category !== channel.category) return false;
                    return ch.i === i + 1;
                });

                if (currentChannelIndex === -1 || nextChannelIndex === -1) return;
                settings.channels[currentChannelIndex].i = i + 1;
                settings.channels[nextChannelIndex].i = i;

                renderChannels();
            });

            initButton(channelElement, translateFunc.get("Edit"), () => {
                categoriesContainer.querySelectorAll("div").forEach(div => div.style.border = "");
                channelElement.style.border = "3px dotted var(--accent)";
                renderEditChannel(channel);
            });

            categoryDiv.appendChild(channelElement);
            addSeparator(categoryDiv, 10);
        });

        categoriesContainer.appendChild(categoryDiv);
    });
}

/**
 * Renders the edit channel interface, allowing users to modify channel details
 * such as name, description, roles, and subscriptions. Provides options to save,
 * cancel, or delete the channel. Handles permission settings for each role and
 * displays subscribed channels with the option to unsubscribe.
 * 
 * @param {Settings_rs__Channel} channel The channel object to edit.
 */

export const renderEditChannel = function (channel: Settings_rs__Channel) {
    const rs_data = rs_dataF();
    const containerElement = rs_data.html.editChannel;
    const settings = rs_data.settings;
    containerElement.innerHTML = `<h1>${translateFunc.get("Edit channel")}</h1>`;

    const nameInp = initInputText(containerElement, translateFunc.get("Name"), channel.name);
    const descInp = initInputText(containerElement, translateFunc.get("Description"), channel.desc || "");

    const flags = vars_channelsFlags();

    function renderRole(role: Settings_rs__Role) {
        const details = document.createElement("details");
        const summary = document.createElement("summary");
        summary.innerHTML = role.name;
        details.appendChild(summary);
        let roleRp = channel.rp.find(rp => rp.startsWith(role._id));
        // @ts-ignore: roleRp is string
        roleRp = roleRp ? parseInt(roleRp.split("/")[1]) : 0;

        flags.forEach((perm, i) => {
            // @ts-ignore: i is number
            const checked = roleRp & (1 << i);
            const checkbox = initCheckbox(details, perm, !!checked);
            checkbox.setAttribute("data-role", role._id);
            checkbox.setAttribute("data-perm", i.toString());
        });
        containerElement.appendChild(details);
        addSeparator(details, 5);
    }

    settings.roles.forEach(renderRole);

    const subscribed = settings.addons.subscribedChannels.filter(tc => tc.tc === channel.chid);
    if (subscribed.length > 0) {
        addSeparator(containerElement, 10);

        const details = document.createElement("details");
        const summary = document.createElement("summary");
        summary.innerHTML = translateFunc.get("Subscribed channels");
        details.appendChild(summary);

        const ul = document.createElement("ul");
        subscribed.forEach(sub => {
            const li = document.createElement("li");
            li.style.marginLeft = "1.2rem";
            li.innerHTML = apis.www.changeChat(sub.sr) + " - " + sub.name;

            const unsubscribe = document.createElement("button");
            unsubscribe.style.marginLeft = "1rem";
            unsubscribe.innerHTML = translateFunc.get("Unsubscribe");
            unsubscribe.addEventListener("click", () => {
                const conf = confirm(translateFunc.get("Are you sure you want to unsubscribe from $?", apis.www.changeChat(sub.sr) + " - " + sub.name));
                if (!conf) return;
                socket.emit("realm.event.channel.unsubscribe", sub.sr, sub.sc, rs_data.realmId, sub.tc);
                settings.addons.subscribedChannels = settings.addons.subscribedChannels.filter(s => s !== sub);
                li.remove();
            });
            li.appendChild(unsubscribe);

            ul.appendChild(li);
        });

        details.appendChild(ul);
        containerElement.appendChild(details);
    }


    addSeparator(containerElement, 15);
    initButton(containerElement, translateFunc.get("Save"), () => {
        channel.name = nameInp.value;
        const desc = descInp.value;
        channel.desc = desc.trim() === "" ? undefined : desc;
        const roles = settings.roles;
        const rolesMap = new Map();
        roles.forEach(role => rolesMap.set(role._id, 0));

        containerElement.querySelectorAll("input[type=checkbox][data-role][data-perm]").forEach(checkbox => {
            // @ts-ignore: checkbox is HTMLInputElement
            if (!checkbox.checked) return;
            const role = checkbox.getAttribute("data-role");
            const perm = checkbox.getAttribute("data-perm");

            const allPerm = rolesMap.get(role);
            // @ts-ignore: perm is string
            const number = 1 << parseInt(perm);
            rolesMap.set(role, allPerm | number);
        });

        channel.rp = Array.from(rolesMap)
            .filter(([, value]) => value !== 0)
            .map(([key, value]) => `${key}/${value}`);

        renderChannels();
        containerElement.fadeOut();
    });

    initButton(containerElement, translateFunc.get("Cancel"), () => {
        renderChannels();
        containerElement.fadeOut();
    });

    initButton(containerElement, translateFunc.get("Delete"), () => {
        const index = settings.channels.findIndex(ch => ch === channel);
        if (index !== -1) {
            settings.channels.splice(index, 1);
            renderChannels();
            containerElement.fadeOut();
        }
    });

    containerElement.fadeIn();
}

/**
 * Renders a form to edit the given category.
 * @param {Settings_rs__Category} category The category to edit
 */
export const renderEditCategory = function (category: Settings_rs__Category) {
    const rs_data = rs_dataF();
    const settings = rs_data.settings;
    if (!settings || !settings.categories) return debugFunc.msg("No settings data");

    const containerElement = rs_data.html.editChannel;
    containerElement.innerHTML = `<h1>${translateFunc.get("Edit category")}</h1>`;

    const nameInput = initInputText(containerElement, translateFunc.get("Name"), category.name);

    addSeparator(containerElement, 15);
    initButton(containerElement, translateFunc.get("Save"), () => {
        category.name = nameInput.value;
        renderChannels();
        containerElement.fadeOut();
    });
    initButton(containerElement, translateFunc.get("Cancel"), () => {
        renderChannels();
        containerElement.fadeOut();
    });
    initButton(containerElement, translateFunc.get("Delete"), () => {
        const index = settings.categories.findIndex(cat => cat.cid === category.cid);
        if (index !== -1) {
            settings.categories.splice(index, 1);
            renderChannels();
            containerElement.fadeOut();
        }
    });

    containerElement.fadeIn();
}

const vars_channelsFlags = () => [
    translateFunc.get("View channel"),
    translateFunc.get("Write messages"),
    translateFunc.get("Send files"),
    translateFunc.get("Add reactions"),
    translateFunc.get("Thread create"),
    translateFunc.get("Thread view"),
    translateFunc.get("Thread write messages"),
]