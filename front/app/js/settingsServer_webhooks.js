SettingsServerManager.prototype.renderWebhooks = function(){
    const container = this.webhookDiv;
    container.innerHTML = `<h1>${translateFunc.get("Webhooks")}</h1>`;

    this.initButton(container, translateFunc.get("Add webhook"), () => {
        function findFirstTextChannel(categories, channels){
            categories = categories.sort((a, b) => a.i - b.i);

            for(let category of categories){
                const textChannels = channels
                    .filter(item => item.type === "text" && item.category === category.cid)
                    .sort((a, b) => a.i - b.i);

                if(textChannels.length > 0) 
                    return textChannels[0].chid;
            }

            return null;
        }

        const id = window.genId();
        const chnl = findFirstTextChannel(this.settings.categories, this.settings.channels);
        if(!chnl) return uiFunc.msg(translateFunc.get("No channels found"));

        const webhook = {
            whid: id,
            name: "Webhook",
            template: "$content",
            chnl,
            ajv: {},
            required: []
        }

        this.settings.webhooks.push(webhook);
        this.renderWebhooks();
        this.renderWebhookEdit(id);
    });
    
    this.addSeparator(container, 15);

    this.settings.webhooks.forEach(webhook => {
        const webhookDiv = document.createElement("div");
        webhookDiv.innerHTML = webhook.name;

        this.initButton(webhookDiv, "Edit", () => {
            this.renderWebhookEdit(webhook.whid);
        });

        container.appendChild(webhookDiv);
    });
}

SettingsServerManager.prototype.renderWebhookEdit = function(id){
    const _this = this;
    const container = this.editWebhookDiv;
    container.innerHTML = `<h1>${translateFunc.get("Edit webhook")}</h1>`;

    const webhook = this.settings.webhooks.find(w => w.whid == id);
    if(!webhook) return uiFunc.msg(translateFunc.get("Webhook not found"));

    if(webhook.token){
        const webhookUrl = `${window.location.origin}/api/webhook/custom?token=${webhook.token}`;
        const webhookUrlCopy = document.createElement("button");
        webhookUrlCopy.innerHTML = "URL (POST) " + translateFunc.get("Copy");
        webhookUrlCopy.onclick = () => {
            utils.writeToClipboard(webhookUrl).then(ok => {
                if(ok) uiFunc.uiMsg(translateFunc.get("Copied to clipboard"));
            });
        }
        container.appendChild(webhookUrlCopy);
    }else{
        const webhookUrl = document.createElement("span");
        webhookUrl.innerHTML = translateFunc.get("Save webhook (and settings) first to get URL");
        container.appendChild(webhookUrl);
    }

    this.addSeparator(container, 15);
    const name = this.initInputText(container, translateFunc.get("Name"), webhook.name);
    this.addSeparator(container, 5);
    const template = this.initInputText(container, translateFunc.get("Template"), webhook.template);

    function renderChnls(categories, channels){
        const select = document.createElement("select");

        categories = categories.sort((a, b) => a.i - b.i);
        for(let category of categories){
            const group = document.createElement("optgroup");
            group.label = category.name;

            channels
                .filter(item => item.category === category.cid)
                .filter(item => item.type === "text")
                .sort((a, b) => a.i - b.i)
                .forEach(channel => {
                    const option = document.createElement("option");
                    option.value = channel.chid;
                    option.innerHTML = channel.name;
                    group.appendChild(option);
                });
            select.appendChild(group);
        }

        return select;
    }

    this.addSeparator(container, 5);
    const chnlLabel = document.createElement("label");
    chnlLabel.innerHTML = translateFunc.get("Channel");
    container.appendChild(chnlLabel);
    
    const chnl = renderChnls(this.settings.categories, this.settings.channels);
    chnl.value = webhook.chnl;
    container.appendChild(chnl);
    
    this.addSeparator(container, 10);
    const advancedDiv = document.createElement("div");
    advancedDiv.innerHTML = `<h2>${translateFunc.get("Advanced")}</h2>`;

    const ajv = this.initInputText(advancedDiv, translateFunc.get("Ajv"), JSON.stringify(webhook.ajv) || "{}");
    this.addSeparator(advancedDiv, 5);
    const required = this.initInputText(advancedDiv, translateFunc.get(`Required fields`), JSON.stringify(webhook.required) || "[]");

    container.appendChild(advancedDiv);

    this.addSeparator(container, 10);

    const embedSettings = document.createElement("div");
    embedSettings.innerHTML = `<h2>${translateFunc.get("Embed settings")}</h2>`;
    this.addSeparator(embedSettings, 5);

    const embed = webhook.embed || {};

    const embedTitle = this.initInputText(embedSettings, translateFunc.get("Title"), embed.title || "");
    this.addSeparator(embedSettings, 5);
    const embedUrl = this.initInputText(embedSettings, translateFunc.get("Url"), embed.url || "");
    this.addSeparator(embedSettings, 5);
    const embedDesc = this.initInputText(embedSettings, translateFunc.get("Description"), embed.description || "");
    this.addSeparator(embedSettings, 5);
    const embedImage = this.initInputText(embedSettings, translateFunc.get("Image"), embed.image || "");
    this.addSeparator(embedSettings, 5);

    const embedCustomFields = document.createElement("div");
    embedCustomFields.innerHTML = `<h3>${translateFunc.get("Custom fields")}</h3>`;
    embedSettings.appendChild(embedCustomFields);
    this.addSeparator(embedCustomFields, 5);

    const embedCustomFieldsData = [];

    function createEmbedCustomFields(key, value){
        const li = document.createElement("li");
        const customFieldName = document.createElement("input");
        const customFieldValue = document.createElement("input");
        customFieldName.type = "text";
        customFieldValue.type = "text";
        customFieldName.value = key;
        customFieldValue.value = value;
        customFieldValue.classList.add("margin-left");
        const data = { name: customFieldName, value: customFieldValue };
        
        const remove = document.createElement("button");
        remove.innerHTML = translateFunc.get("Remove");
        remove.classList.add("margin-left");
        remove.addEventListener("click", () => {
            embedCustomFieldsData.splice(embedCustomFieldsData.indexOf(data), 1);
            li.remove();
        });

        li.appendChild(customFieldName);
        li.appendChild(customFieldValue);
        li.appendChild(remove);
        _this.addSeparator(li, 5);
        embedCustomFieldsList.appendChild(li);
        embedCustomFieldsData.push(data);
    }

    this.initButton(embedCustomFields, translateFunc.get("Add"), () => createEmbedCustomFields("",""));
    this.addSeparator(embedSettings, 5);

    const embedCustomFieldsList = document.createElement("ul");
    embedCustomFieldsList.style.listStyleType = "none";
    embedCustomFieldsList.style.paddingLeft = "3px";
    embedCustomFields.appendChild(embedCustomFieldsList);
    this.addSeparator(embedCustomFieldsList, 5);

    if(webhook.embed && webhook.embed.customFields){
        Object.entries(webhook.embed.customFields).forEach(([key, value]) => createEmbedCustomFields(key, value));
    }

    container.appendChild(embedSettings);

    this.addSeparator(container, 15);
    this.initButton(container, translateFunc.get("Save"), () => {
        webhook.name = name.value;
        webhook.template = template.value;
        webhook.ajv = ajv.value ? JSON.parse(ajv.value) : {};
        webhook.required = required.value ? JSON.parse(required.value) : [];
        webhook.chnl = chnl.value;

        if(embedTitle.value.trim() !== ""){
            const embed = {
                title: embedTitle.value.trim(),
                url: embedUrl.value.trim(),
                description: embedDesc.value.trim(),
                image: embedImage.value.trim(),
                customFields:
                    embedCustomFieldsData
                    .map(({ name, value }) => ({ name: name.value.trim(), value: value.value.trim() }))
                    .reduce((acc, { name, value }) => { acc[name] = value; return acc; }, {})
            }

            webhook.embed = embed;
        }else{
            webhook.embed = undefined;
        }

        this.renderWebhooks();
        container.fadeOut();
    });

    this.initButton(container, translateFunc.get("Cancel"), () => {
        container.fadeOut();
        if(!webhook.embed.title) webhook.embed = undefined;
    });

    this.initButton(container, translateFunc.get("Delete"), () => {
        this.settings.webhooks = this.settings.webhooks.filter(w => w.whid != id);
        this.renderWebhooks();
        container.fadeOut();
    });

    container.fadeIn();
}