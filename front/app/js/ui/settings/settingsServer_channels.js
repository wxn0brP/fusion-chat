import hub from "../../hub.js";
hub("settingsServer_channels");

import genId from "../../utils/genId.js";
import translateFunc from "../../utils/translate.js";
import uiFunc from "../helpers/uiFunc.js";
import apis from "../../api/apis.js";
import socket from "../../core/socket/ws.js";

export const renderChannels = function(_this){
    const categoriesContainer = _this.categoryDiv;
    categoriesContainer.innerHTML = `<h1>${translateFunc.get("Categories & Channels")}</h1>`;

    const sortedCategories = _this.settings.categories.sort((a, b) => a.i - b.i);
    const channels = _this.settings.channels;

    _this.initButton(categoriesContainer, translateFunc.get("Add category"), async () => {
        const name = await uiFunc.prompt("Name");

        _this.settings.categories.push({
            cid: genId(),
            name: name || "New Category",
            i: _this.settings.categories.length
        });
        _this.renderChannels();
    })

    sortedCategories.forEach(category => {
        _this.addSeparator(categoriesContainer, 15);
        const categoryDiv = document.createElement("div");
        categoryDiv.innerHTML = `<span style="font-size: 1.5rem" class="settings__nameSpan">- ${category.name}</span>`;

        _this.initButton(categoryDiv, translateFunc.get("Move up"), () => {
            if(category.i === 0) return;

            const i = category.i;
            _this.settings.categories[i].i = i - 1;
            _this.settings.categories[i - 1].i = i;
            _this.renderChannels();
        });

        _this.initButton(categoryDiv, translateFunc.get("Move down"), () => {
            if(category.i === sortedCategories.length - 1) return;

            const i = category.i;
            _this.settings.categories[i].i = i + 1;
            _this.settings.categories[i + 1].i = i;
            _this.renderChannels();
        });

        _this.initButton(categoryDiv, translateFunc.get("Edit"), () => {
            categoriesContainer.querySelectorAll("div").forEach(div => div.style.border = "");
            categoryDiv.style.border = "3px dotted var(--accent)";
            renderEditCategory(_this, category);
        });

        _this.initButton(categoryDiv, translateFunc.get("Add channel"), async () => {
            const name = await uiFunc.prompt(translateFunc.get("Enter name"));
            const type = await uiFunc.selectPrompt(
                translateFunc.get("Enter type"),
                [ translateFunc.get("Text"), translateFunc.get("Voice"), translateFunc.get("Realm Event"), translateFunc.get("Open Event") ],
                ["text", "voice", "realm_event", "open_event"]
            );

            const newChannel = {
                name: name || "New Channel",
                type: type || "text",
                category: category.cid,
                i: channels.filter(channel => channel.category === category.cid).length,
                rp: [],
                chid: genId(),
                desc: ""
            };
            _this.settings.channels.push(newChannel);
            _this.renderChannels(); 
        });

        _this.addSeparator(categoryDiv, 10);

        const categoryChannels = channels.filter(channel => channel.category === category.cid).sort((a, b) => a.i - b.i);
        categoryChannels.forEach(channel => {
            const channelElement = document.createElement("div");
            channelElement.innerHTML =
                `<span style="font-size: 1.2rem" class="settings__nameSpan">${"&nbsp;".repeat(3)}+ ${channel.name} (${channel.type})</span>`;

            _this.initButton(channelElement, translateFunc.get("Move up"), () => {
                if(channel.i === 0) return;

                const i = channel.i;
                
                const currentChannelIndex = _this.settings.channels.findIndex(ch => {
                    if(ch.category !== channel.category) return false;
                    return ch.i === i;
                });
                const previousChannelIndex = _this.settings.channels.findIndex(ch => {
                    if(ch.category !== channel.category) return false;
                    return ch.i === i - 1;
                });

                if(currentChannelIndex === -1 || previousChannelIndex === -1) return;
                _this.settings.channels[currentChannelIndex].i = i - 1;
                _this.settings.channels[previousChannelIndex].i = i;

                _this.renderChannels();
            });

            _this.initButton(channelElement, translateFunc.get("Move down"), () => {
                if(channel.i >= categoryChannels.length - 1) return;

                const i = channel.i;

                const currentChannelIndex = _this.settings.channels.findIndex(ch => {
                    if(ch.category !== channel.category) return false;
                    return ch.i === i;
                });
                const nextChannelIndex = _this.settings.channels.findIndex(ch => {
                    if(ch.category !== channel.category) return false;
                    return ch.i === i + 1;
                });

                if(currentChannelIndex === -1 || nextChannelIndex === -1) return;
                _this.settings.channels[currentChannelIndex].i = i + 1;
                _this.settings.channels[nextChannelIndex].i = i;

                _this.renderChannels();
            });

            _this.initButton(channelElement, translateFunc.get("Edit"), () => {
                categoriesContainer.querySelectorAll("div").forEach(div => div.style.border = "");
                channelElement.style.border = "3px dotted var(--accent)";
                renderEditChannel(_this, channel); 
            });

            categoryDiv.appendChild(channelElement);
            _this.addSeparator(categoryDiv, 10);
        });

        categoriesContainer.appendChild(categoryDiv);
    });
}

export const renderEditChannel = function(_this, channel){
    const containerElement = _this.editChannelDiv;
    containerElement.innerHTML = `<h1>${translateFunc.get("Edit channel")}</h1>`;

    const nameInp = _this.initInputText(containerElement, translateFunc.get("Name"), channel.name);
    const descInp = _this.initInputText(containerElement, translateFunc.get("Description"), channel.desc || "");

    const flags = vars_channelsFlags();

    function renderRole(role){
        const details = document.createElement("details");
        const summary = document.createElement("summary");
        summary.innerHTML = role.name;
        details.appendChild(summary);
        let roleRp = channel.rp.find(rp => rp.startsWith(role._id));
        roleRp = roleRp ? parseInt(roleRp.split("/")[1]) : 0;

        flags.forEach((perm, i) => {
            const checked = roleRp & (1 << i);
            const checkbox = _this.initCheckbox(details, perm, checked);
            checkbox.setAttribute("data-role", role._id);
            checkbox.setAttribute("data-perm", i);
        });
        containerElement.appendChild(details);
        _this.addSeparator(details, 5);
    }

    _this.settings.roles.forEach(renderRole);

    const subscribed = _this.settings.addons.subscribedChannels.filter(tc => tc.tc === channel.chid);
    if(subscribed.length > 0){
        _this.addSeparator(containerElement, 10);

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
                if(!conf) return;
                socket.emit("realm.event.channel.unsubscribe", sub.sr, sub.sc, _this.realmId, sub.tc);
                _this.settings.addons.subscribedChannels = _this.settings.addons.subscribedChannels.filter(s => s !== sub);
                li.remove();
            });
            li.appendChild(unsubscribe);

            ul.appendChild(li);
        });

        details.appendChild(ul);
        containerElement.appendChild(details);
    }
    

    _this.addSeparator(containerElement, 15);
    _this.initButton(containerElement, translateFunc.get("Save"), () => {
        channel.name = nameInp.value;
        const desc = descInp.value;
        channel.desc = desc.trim() === "" ? undefined : desc;
        const roles = _this.settings.roles;
        const rolesMap = new Map();
        roles.forEach(role => rolesMap.set(role._id, 0));

        containerElement.querySelectorAll("input[type=checkbox][data-role][data-perm]").forEach(checkbox => {
            if(!checkbox.checked) return;
            const role = checkbox.getAttribute("data-role");
            const perm = checkbox.getAttribute("data-perm");
            
            const allPerm = rolesMap.get(role);
            const number = 1 << parseInt(perm);
            rolesMap.set(role, allPerm | number);
        });

        channel.rp =  Array.from(rolesMap)
            .filter(([, value]) => value !== 0)
            .map(([key, value]) => `${key}/${value}`);

        _this.renderChannels();
        containerElement.fadeOut();
    });

    _this.initButton(containerElement, translateFunc.get("Cancel"), () => {
        _this.renderChannels();
        containerElement.fadeOut();
    });

    _this.initButton(containerElement, translateFunc.get("Delete"), () => {
        const index = _this.settings.channels.findIndex(ch => ch === channel);
        if(index !== -1){
            _this.settings.channels.splice(index, 1);
            _this.renderChannels();
            containerElement.fadeOut();
        }
    });

    containerElement.fadeIn();
}

export const renderEditCategory = function(_this, category){
    const containerElement = _this.editChannelDiv;
    containerElement.innerHTML = `<h1>${translateFunc.get("Edit category")}</h1>`;

    const nameInput = _this.initInputText(containerElement, translateFunc.get("Name"), category.name);

    _this.addSeparator(containerElement, 15);
    _this.initButton(containerElement, translateFunc.get("Save"), () => {
        _this.settings.categories.find(cat => cat === category).name = nameInput.value;
        _this.renderChannels();
        containerElement.fadeOut();
    });
    _this.initButton(containerElement, translateFunc.get("Cancel"), () => {
        _this.renderChannels();
        containerElement.fadeOut();
    });
    _this.initButton(containerElement, translateFunc.get("Delete"), () => {
        const index = _this.settings.categories.findIndex(cat => cat.cid === category.cid);
        if(index !== -1){
            _this.settings.categories.splice(index, 1);
            _this.renderChannels();
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