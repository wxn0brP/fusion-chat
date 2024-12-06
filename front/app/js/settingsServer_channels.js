SettingsServerManager.prototype.renderChannels = function(){
    const categoriesContainer = this.categoryDiv;
    categoriesContainer.innerHTML = `<h1>${translateFunc.get("Categories & Channels")}</h1>`;

    const sortedCategories = this.settings.categories.sort((a, b) => a.i - b.i);
    const channels = this.settings.channels;

    this.initButton(categoriesContainer, translateFunc.get("Add category"), async () => {
        const name = await uiFunc.prompt("Name");

        this.settings.categories.push({
            cid: window.genId(),
            name: name || "New Category",
            i: this.settings.categories.length
        });
        this.renderChannels();
    })

    sortedCategories.forEach(category => {
        this.addSeparator(categoriesContainer, 15);
        const categoryDiv = document.createElement("div");
        categoryDiv.innerHTML = `<span style="font-size: 1.5rem" class="settings__nameSpan">- ${category.name}</span>`;

        this.initButton(categoryDiv, translateFunc.get("Move up"), () => {
            if(category.i === 0) return;

            const i = category.i;
            this.settings.categories[i].i = i - 1;
            this.settings.categories[i - 1].i = i;
            this.renderChannels();
        });

        this.initButton(categoryDiv, translateFunc.get("Move down"), () => {
            if(category.i === sortedCategories.length - 1) return;

            const i = category.i;
            this.settings.categories[i].i = i + 1;
            this.settings.categories[i + 1].i = i;
            this.renderChannels();
        });

        this.initButton(categoryDiv, translateFunc.get("Edit"), () => {
            categoriesContainer.querySelectorAll("div").forEach(div => div.style.border = "");
            categoryDiv.style.border = "3px dotted var(--accent)";
            this.renderEditCategory(category);
        });

        this.initButton(categoryDiv, translateFunc.get("Add channel"), async () => {
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
                chid: window.genId(),
                desc: ""
            };
            this.settings.channels.push(newChannel);
            this.renderChannels(); 
        });

        this.addSeparator(categoryDiv, 10);

        const categoryChannels = channels.filter(channel => channel.category === category.cid).sort((a, b) => a.i - b.i);
        categoryChannels.forEach(channel => {
            const channelElement = document.createElement("div");
            channelElement.innerHTML =
                `<span style="font-size: 1.2rem" class="settings__nameSpan">${"&nbsp;".repeat(3)}+ ${channel.name} (${channel.type})</span>`;

            this.initButton(channelElement, translateFunc.get("Move up"), () => {
                if(channel.i === 0) return;

                const i = channel.i;
                
                const currentChannelIndex = this.settings.channels.findIndex(ch => {
                    if(ch.category !== channel.category) return false;
                    return ch.i === i;
                });
                const previousChannelIndex = this.settings.channels.findIndex(ch => {
                    if(ch.category !== channel.category) return false;
                    return ch.i === i - 1;
                });

                if(currentChannelIndex === -1 || previousChannelIndex === -1) return;
                this.settings.channels[currentChannelIndex].i = i - 1;
                this.settings.channels[previousChannelIndex].i = i;

                this.renderChannels();
            });

            this.initButton(channelElement, translateFunc.get("Move down"), () => {
                if(channel.i >= categoryChannels.length - 1) return;

                const i = channel.i;

                const currentChannelIndex = this.settings.channels.findIndex(ch => {
                    if(ch.category !== channel.category) return false;
                    return ch.i === i;
                });
                const nextChannelIndex = this.settings.channels.findIndex(ch => {
                    if(ch.category !== channel.category) return false;
                    return ch.i === i + 1;
                });

                if(currentChannelIndex === -1 || nextChannelIndex === -1) return;
                this.settings.channels[currentChannelIndex].i = i + 1;
                this.settings.channels[nextChannelIndex].i = i;

                this.renderChannels();
            });

            this.initButton(channelElement, translateFunc.get("Edit"), () => {
                categoriesContainer.querySelectorAll("div").forEach(div => div.style.border = "");
                channelElement.style.border = "3px dotted var(--accent)";
                this.renderEditChannel(channel); 
            });

            categoryDiv.appendChild(channelElement);
            this.addSeparator(categoryDiv, 10);
        });

        categoriesContainer.appendChild(categoryDiv);
    });
}

SettingsServerManager.prototype.renderEditChannel = function(channel){
    const containerElement = this.editChannelDiv;
    containerElement.innerHTML = `<h1>${translateFunc.get("Edit channel")}</h1>`;

    const nameInp = this.initInputText(containerElement, translateFunc.get("Name"), channel.name);
    const descInp = this.initInputText(containerElement, translateFunc.get("Description"), channel.desc || "");
    const _this = this;

    const allPerm = [
        { name: translateFunc.get("Write messages"), id: "text" },
        { name: translateFunc.get("Show channel"), id: "visable" },
    ];

    function renderRole(role){
        const details = document.createElement("details");
        const summary = document.createElement("summary");
        summary.innerHTML = role.name;
        details.appendChild(summary);

        allPerm.forEach(perm => {
            const checkbox = _this.initCheckbox(details, perm.name, false);
            checkbox.checked = channel.rp.includes(role._id + "/" + perm.id);
            checkbox.setAttribute("data-role", role._id);
            checkbox.setAttribute("data-perm", perm.id);
        });
        containerElement.appendChild(details);
        _this.addSeparator(details, 5);
    }

    this.settings.roles.forEach(renderRole);

    this.addSeparator(containerElement, 15);
    this.initButton(containerElement, translateFunc.get("Save"), () => {
        channel.name = nameInp.value;
        const desc = descInp.value;
        channel.desc = desc.trim() === "" ? undefined : desc;
        channel.rp = [];

        containerElement.querySelectorAll("input[type=checkbox][data-role][data-perm]").forEach(checkbox => {
            if(!checkbox.checked) return;
            const role = checkbox.getAttribute("data-role");
            const perm = checkbox.getAttribute("data-perm");
            channel.rp.push(role + "/" + perm);
        });

        this.renderChannels();
        containerElement.fadeOut();
    });

    this.initButton(containerElement, translateFunc.get("Cancel"), () => {
        this.renderChannels();
        containerElement.fadeOut();
    });

    this.initButton(containerElement, translateFunc.get("Delete"), () => {
        const index = this.settings.channels.findIndex(ch => ch === channel);
        if(index !== -1){
            this.settings.channels.splice(index, 1);
            this.renderChannels();
            containerElement.fadeOut();
        }
    });

    containerElement.fadeIn();
}

SettingsServerManager.prototype.renderEditCategory = function(category){
    const containerElement = this.editChannelDiv;
    containerElement.innerHTML = `<h1>${translateFunc.get("Edit category")}</h1>`;

    const nameInput = this.initInputText(containerElement, translateFunc.get("Name"), category.name);

    this.addSeparator(containerElement, 15);
    this.initButton(containerElement, translateFunc.get("Save"), () => {
        this.settings.categories.find(cat => cat === category).name = nameInput.value;
        this.renderChannels();
        containerElement.fadeOut();
    });
    this.initButton(containerElement, translateFunc.get("Cancel"), () => {
        this.renderChannels();
        containerElement.fadeOut();
    });
    this.initButton(containerElement, translateFunc.get("Delete"), () => {
        const index = this.settings.categories.findIndex(cat => cat.cid === category.cid);
        if(index !== -1){
            this.settings.categories.splice(index, 1);
            this.renderChannels();
            containerElement.fadeOut();
        }
    });

    containerElement.fadeIn();
}