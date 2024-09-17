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
    const container = this.editWebhookDiv;
    container.innerHTML = `<h1>${translateFunc.get("Edit webhook")}</h1>`;

    const webhook = this.settings.webhooks.find(w => w.whid == id);
    if(!webhook) return uiFunc.msg(translateFunc.get("Webhook not found"));

    const webhookUrl = `URL (POST): <b>${window.location.origin}/api/webhook/custom?id=${id}&chat=${this.serverId}&chnl=${webhook.chnl}</b>`;
    const webhookUrlSpan = document.createElement("span");
    webhookUrlSpan.innerHTML = webhookUrl;
    container.appendChild(webhookUrlSpan);

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
    this.initButton(container, translateFunc.get("Save"), () => {
        webhook.name = name.value;
        webhook.template = template.value;
        webhook.ajv = ajv.value ? JSON.parse(ajv.value) : {};
        webhook.required = required.value ? JSON.parse(required.value) : [];
        this.renderWebhooks();
        container.fadeOut();
    });

    this.initButton(container, translateFunc.get("Cancel"), () => {
        container.fadeOut();
    });

    this.initButton(container, translateFunc.get("Delete"), () => {
        this.settings.webhooks = this.settings.webhooks.filter(w => w.whid != id);
        this.renderWebhooks();
        container.fadeOut();
    });

    container.fadeIn();
}