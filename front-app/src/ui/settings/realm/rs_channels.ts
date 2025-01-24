import hub from "../../../hub";
hub("rs/channels");

import rs_dataF from "./rs_var";
import apis from "../../../api/apis";
import genId from "../../../utils/genId";
import uiFunc from "../../helpers/uiFunc";
import debugFunc, { LogLevel } from "../../../core/debug";
import socket from "../../../core/socket/socket";
import { Settings_rs__Category, Settings_rs__Channel, Settings_rs__Role } from "./types";
import { Channel_Type } from "../../../types/channel";
import LangPkg, { langFunc } from "../../../utils/translate";
import {
    initInputText,
    initButton,
    addSeparator,
    initCheckbox,
} from "./rs_utils";

export const renderChannels = function () {
    const rs_data = rs_dataF();
    const settings = rs_data.settings;
    if (!settings || !settings.categories || !settings.channels) return debugFunc.msg(LogLevel.ERROR, LangPkg.settings_realm.no_data);

    const categoriesContainer = rs_data.html.category;
    categoriesContainer.innerHTML = `<h1>${LangPkg.settings_realm.categories_and_channels}</h1>`;

    const sortedCategories = settings.categories.sort((a, b) => a.i - b.i);
    const channels = settings.channels;

    initButton(categoriesContainer, LangPkg.settings_realm.add_category, async () => {
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

        initButton(categoryDiv, LangPkg.settings_realm.move_up, () => {
            if (category.i === 0) return;

            const i = category.i;
            settings.categories[i].i = i - 1;
            settings.categories[i - 1].i = i;
            renderChannels();
        });

        initButton(categoryDiv, LangPkg.settings_realm.move_down, () => {
            if (category.i === sortedCategories.length - 1) return;

            const i = category.i;
            settings.categories[i].i = i + 1;
            settings.categories[i + 1].i = i;
            renderChannels();
        });

        initButton(categoryDiv, LangPkg.uni.edit, () => {
            categoriesContainer.querySelectorAll("div").forEach(div => div.style.border = "");
            categoryDiv.style.border = "3px dotted var(--accent)";
            renderEditCategory(category);
        });

        initButton(categoryDiv, LangPkg.settings_realm.add_channel, async () => {
            const name = await uiFunc.prompt(LangPkg.settings_realm.enter_name);
            const { text, voice, announcement, open_announcement, forum } = LangPkg.settings_realm.channel_types;
            const type = await uiFunc.selectPrompt(
                LangPkg.settings_realm.select_type,
                [text, voice, announcement, open_announcement, forum],
                ["text", "voice", "announcement", "open_announcement", "forum"]
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

            initButton(channelElement, LangPkg.settings_realm.move_up, () => {
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

            initButton(channelElement, LangPkg.settings_realm.move_down, () => {
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

            initButton(channelElement, LangPkg.uni.edit, () => {
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
    containerElement.innerHTML = `<h1>${LangPkg.settings_realm.edit_channel}</h1>`;

    const nameInp = initInputText(containerElement, LangPkg.settings.name, channel.name);
    const descInp = initInputText(containerElement, LangPkg.settings.description, channel.desc || "");

    function renderRole(role: Settings_rs__Role) {
        const details = document.createElement("details");
        const summary = document.createElement("summary");
        summary.innerHTML = role.name;
        details.appendChild(summary);
        let roleRp = channel.rp.find(rp => rp.startsWith(role._id));
        // @ts-ignore: roleRp is string
        roleRp = roleRp ? parseInt(roleRp.split("/")[1]) : 0;

        vars_channelsFlags().forEach((perm, i) => {
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
        summary.innerHTML = LangPkg.settings_realm.subscribed_channels;
        details.appendChild(summary);

        const ul = document.createElement("ul");
        subscribed.forEach(sub => {
            const li = document.createElement("li");
            li.style.marginLeft = "1.2rem";
            li.innerHTML = apis.www.changeChat(sub.sr) + " - " + sub.name;

            const unsubscribe = document.createElement("button");
            unsubscribe.style.marginLeft = "1rem";
            unsubscribe.innerHTML = LangPkg.settings_realm.unsubscribe_channel;
            unsubscribe.addEventListener("click", async () => {
                const text = langFunc(LangPkg.settings_realm.confirm_unsubscribe, apis.www.changeChat(sub.sr) + " - " + sub.name) + "?";
                const conf = await uiFunc.confirm(text);
                if (!conf) return;
                socket.emit("realm.announcement.channel.unsubscribe", sub.sr, sub.sc, rs_data.realmId, sub.tc);
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
    initButton(containerElement, LangPkg.settings.save, () => {
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

    initButton(containerElement, LangPkg.uni.cancel, () => {
        renderChannels();
        containerElement.fadeOut();
    });

    initButton(containerElement, LangPkg.uni.delete, () => {
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
    if (!settings || !settings.categories) return debugFunc.msg(LogLevel.ERROR, "No settings data");

    const containerElement = rs_data.html.editChannel;
    containerElement.innerHTML = `<h1>${LangPkg.settings_realm.edit_category}</h1>`;

    const nameInput = initInputText(containerElement, LangPkg.settings.name, category.name);

    addSeparator(containerElement, 15);
    initButton(containerElement, LangPkg.settings.save, () => {
        category.name = nameInput.value;
        renderChannels();
        containerElement.fadeOut();
    });
    initButton(containerElement, LangPkg.uni.cancel, () => {
        renderChannels();
        containerElement.fadeOut();
    });
    initButton(containerElement, LangPkg.uni.delete, () => {
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
    LangPkg.settings_realm.mess_permissions.view,
    LangPkg.settings_realm.mess_permissions.write,
    LangPkg.settings_realm.mess_permissions.files,
    LangPkg.settings_realm.mess_permissions.reactions,
    LangPkg.settings_realm.mess_permissions.thread,
    LangPkg.settings_realm.mess_permissions.thread_view,
    LangPkg.settings_realm.mess_permissions.thread_write
]