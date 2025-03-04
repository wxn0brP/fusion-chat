import hub from "../../../hub.js";
hub("rs/webhooks");
import genId from "../../../utils/genId.js";
import uiFunc from "../../helpers/uiFunc.js";
import rs_dataF from "./rs_var.js";
import utils from "../../../utils/utils.js";
import { addSeparator, initButton, initInputText } from "./rs_utils.js";
import LangPkg from "../../../utils/translate.js";
import debugFunc, { LogLevel } from "../../../core/debug.js";
import socket from "../../../core/socket/socket.js";
const webhook_available_channels_type = [
    "text",
    "open_announcement",
    "announcement",
];
export const renderWebhooks = function () {
    const rs_data = rs_dataF();
    const settings = rs_data.settings;
    if (!settings || !settings.webhooks)
        return debugFunc.msg(LogLevel.ERROR, LangPkg.settings_realm.no_data);
    const container = rs_data.html.webhook;
    container.innerHTML = `<h1>${LangPkg.settings_realm.webhooks.webhook}</h1>`;
    initButton(container, LangPkg.settings_realm.add_webhook, () => {
        function findFirstTextChannel(categories, channels) {
            categories = categories.sort((a, b) => a.i - b.i);
            for (let category of categories) {
                const textChannels = channels
                    .filter(item => item.type === "text" && item.category === category.cid)
                    .sort((a, b) => a.i - b.i);
                if (textChannels.length > 0)
                    return textChannels[0].chid;
            }
            return null;
        }
        const id = "$" + genId();
        const chnl = findFirstTextChannel(settings.categories, settings.channels);
        if (!chnl)
            return uiFunc.uiMsgT(LangPkg.settings_realm.no_channels);
        const webhook = {
            whid: id,
            name: "Webhook",
            template: "$content",
            chnl,
            ajv: {},
            required: []
        };
        settings.webhooks.push(webhook);
        renderWebhooks();
        renderWebhookEdit(id);
    });
    addSeparator(container, 15);
    settings.webhooks.forEach(webhook => {
        const webhookDiv = document.createElement("div");
        webhookDiv.innerHTML = webhook.name;
        initButton(webhookDiv, "Edit", () => {
            renderWebhookEdit(webhook.whid);
        });
        container.appendChild(webhookDiv);
    });
};
export const renderWebhookEdit = function (id) {
    const rs_data = rs_dataF();
    const settings = rs_data.settings;
    const container = rs_data.html.editWebhook;
    container.innerHTML = `<h1>${LangPkg.settings_realm.edit_webhook}</h1>`;
    const webhook = settings.webhooks.find(w => w.whid == id);
    if (!webhook)
        return uiFunc.uiMsgT(LangPkg.settings_realm.webhooks.not_found);
    if (!webhook.whid.startsWith("$")) {
        const webhookUrlCopy = document.createElement("button");
        webhookUrlCopy.innerHTML = "URL (POST) " + LangPkg.uni.copy;
        webhookUrlCopy.onclick = () => {
            socket.emit("realm.webhook.token.get", rs_data.realmId, webhook.whid, (token) => {
                const webhookUrl = `${window.location.origin}/api/webhook/custom?token=${token}`;
                utils.writeToClipboard(webhookUrl).then(ok => {
                    if (ok)
                        uiFunc.uiMsgT(LangPkg.ui.copied);
                });
            });
        };
        container.appendChild(webhookUrlCopy);
    }
    else {
        const webhookUrl = document.createElement("span");
        webhookUrl.innerHTML = LangPkg.settings_realm.webhooks.get_url_before;
        container.appendChild(webhookUrl);
    }
    const webhookLang = LangPkg.settings_realm.webhooks;
    addSeparator(container, 15);
    const name = initInputText(container, LangPkg.settings.name, webhook.name);
    addSeparator(container, 5);
    const template = initInputText(container, webhookLang.template, webhook.template);
    function renderChnls(categories, channels) {
        const select = document.createElement("select");
        categories = categories.sort((a, b) => a.i - b.i);
        for (let category of categories) {
            const group = document.createElement("optgroup");
            group.label = category.name;
            channels
                .filter(item => item.category === category.cid)
                .filter(item => webhook_available_channels_type.includes(item.type))
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
    addSeparator(container, 5);
    const chnlLabel = document.createElement("label");
    chnlLabel.innerHTML = webhookLang.channel;
    container.appendChild(chnlLabel);
    const chnl = renderChnls(settings.categories, settings.channels);
    chnl.value = webhook.chnl;
    container.appendChild(chnl);
    addSeparator(container, 10);
    const advancedDiv = document.createElement("div");
    advancedDiv.innerHTML = `<h2>${webhookLang.advanced}</h2>`;
    const ajv = initInputText(advancedDiv, webhookLang.ajv, JSON.stringify(webhook.ajv) || "{}");
    addSeparator(advancedDiv, 5);
    const required = initInputText(advancedDiv, webhookLang.required_fields, JSON.stringify(webhook.required) || "[]");
    container.appendChild(advancedDiv);
    addSeparator(container, 10);
    const embedSettings = document.createElement("div");
    embedSettings.innerHTML = `<h2>${webhookLang.embed_settings}</h2>`;
    addSeparator(embedSettings, 5);
    const embed = webhook.embed;
    const embedTitle = initInputText(embedSettings, webhookLang.title, embed?.title || "");
    addSeparator(embedSettings, 5);
    const embedUrl = initInputText(embedSettings, webhookLang.url, embed?.url || "");
    addSeparator(embedSettings, 5);
    const embedDesc = initInputText(embedSettings, LangPkg.settings.description, embed?.description || "");
    addSeparator(embedSettings, 5);
    const embedImage = initInputText(embedSettings, webhookLang.image, embed?.image || "");
    addSeparator(embedSettings, 5);
    const embedCustomFields = document.createElement("div");
    embedCustomFields.innerHTML = `<h3>${webhookLang.custom_fields}</h3>`;
    embedSettings.appendChild(embedCustomFields);
    addSeparator(embedCustomFields, 5);
    const embedCustomFieldsData = [];
    function createEmbedCustomFields(key, value) {
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
        remove.innerHTML = LangPkg.uni.delete;
        remove.classList.add("margin-left");
        remove.addEventListener("click", () => {
            embedCustomFieldsData.splice(embedCustomFieldsData.indexOf(data), 1);
            li.remove();
        });
        li.appendChild(customFieldName);
        li.appendChild(customFieldValue);
        li.appendChild(remove);
        addSeparator(li, 5);
        embedCustomFieldsList.appendChild(li);
        embedCustomFieldsData.push(data);
    }
    initButton(embedCustomFields, LangPkg.uni.add, () => createEmbedCustomFields("", ""));
    addSeparator(embedSettings, 5);
    const embedCustomFieldsList = document.createElement("ul");
    embedCustomFieldsList.style.listStyleType = "none";
    embedCustomFieldsList.style.paddingLeft = "3px";
    embedCustomFields.appendChild(embedCustomFieldsList);
    addSeparator(embedCustomFieldsList, 5);
    if (webhook.embed && webhook.embed.customFields) {
        Object.entries(webhook.embed.customFields).forEach(([key, value]) => createEmbedCustomFields(key, value));
    }
    container.appendChild(embedSettings);
    addSeparator(container, 15);
    initButton(container, LangPkg.settings.save, () => {
        webhook.name = name.value;
        webhook.template = template.value;
        webhook.ajv = ajv.value ? JSON.parse(ajv.value) : {};
        webhook.required = required.value ? JSON.parse(required.value) : [];
        webhook.chnl = chnl.value;
        if (embedTitle.value.trim() !== "") {
            const embed = {
                title: embedTitle.value.trim(),
                url: embedUrl.value.trim(),
                description: embedDesc.value.trim(),
                image: embedImage.value.trim(),
                customFields: embedCustomFieldsData
                    .map(({ name, value }) => ({ name: name.value.trim(), value: value.value.trim() }))
                    .reduce((acc, { name, value }) => { acc[name] = value; return acc; }, {})
            };
            webhook.embed = embed;
        }
        else {
            webhook.embed = undefined;
        }
        renderWebhooks();
        container.fadeOut();
    });
    initButton(container, LangPkg.uni.cancel, () => {
        container.fadeOut();
        if (!webhook.embed?.title)
            webhook.embed = undefined;
    });
    initButton(container, LangPkg.uni.delete, () => {
        settings.webhooks = settings.webhooks.filter(w => w.whid != id);
        renderWebhooks();
        container.fadeOut();
    });
    container.fadeIn();
};
//# sourceMappingURL=rs_webhooks.js.map