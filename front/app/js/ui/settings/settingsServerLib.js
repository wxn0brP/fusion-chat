import hub from "../../hub.js";
hub("settingsServerLib");

import translateFunc from "../../utils/translate.js";
import { renderMeta } from "./settingsServer_meta.js";
import { renderEmojis } from "./settingsServer_emoji.js";
import { renderUserRoleManager } from "./settingsServer_users.js";
import { renderRoleEdit, renderRoles } from "./settingsServer_roles.js";
import { saveSettings, exitWithoutSaving } from "./settingsServer_save.js";
import { renderCategorySwitcher, changeDisplay } from "./settingsServer_nav.js";
import { renderWebhooks, renderWebhookEdit } from "./settingsServer_webhooks.js";
import { renderChannels, renderEditChannel, renderEditCategory } from "./settingsServer_channels.js";
import { initButton, initCategoryElement, addSeparator, initInputText, initCheckbox } from "./settingsServer_utils.js";

class SettingsServerManager{
    constructor(settings, realmId, container, saveCallback, exitCallback){
        this.settings = settings;
        this.saveCallback = saveCallback;
        this.exitCallback = exitCallback;
        this.container = container;
        this.realmId = realmId;
        this.initModules();
        this.init();
    }

    /* init gui elements */

    init(){
        this.container.innerHTML = "";

        renderCategorySwitcher(this);

        this.metaDiv = this.initCategoryElement();
        this.categoryDiv = this.initCategoryElement();
        this.editChannelDiv = this.initCategoryElement();
        this.roleDiv = this.initCategoryElement();
        this.editRoleDiv = this.initCategoryElement();
        this.usersManagerDiv = this.initCategoryElement();
        this.emojiDiv = this.initCategoryElement();
        this.webhookDiv = this.initCategoryElement();
        this.editWebhookDiv = this.initCategoryElement();

        this.renderMeta(this);
        this.renderChannels(this);
        this.renderRoles(this);
        this.renderUserRoleManager(this);
        this.renderEmojis(this);
        this.renderWebhooks(this);
        this.changeDisplay(this, { meta: true });

        const saveButton = document.createElement("button");
        saveButton.textContent = translateFunc.get("Save");
        saveButton.className = "settings__exitButton";
        saveButton.onclick = () => this.saveSettings(this);
        
        const exitButton = document.createElement("button");
        exitButton.textContent = translateFunc.get("Exit without save");
        exitButton.className = "settings__exitButton";
        exitButton.onclick = () => this.exitWithoutSaving(this);

        this.container.appendChild(document.createElement("br"));
        this.container.appendChild(saveButton);
        this.container.appendChild(exitButton);
        this.container.fadeIn();
    }

    initModules(){
        this.renderChannels = renderChannels;
        this.renderEditChannel = renderEditChannel;
        this.renderRoles = renderRoles;
        this.renderRoleEdit = renderRoleEdit;
        this.renderEmojis = renderEmojis;
        this.renderWebhooks = renderWebhooks;
        this.renderMeta = renderMeta;
        this.renderUserRoleManager = renderUserRoleManager;
        this.initCategoryElement = initCategoryElement;
        this.initButton = initButton;
        this.addSeparator = addSeparator;
        this.initInputText = initInputText;
        this.initCheckbox = initCheckbox;
        this.changeDisplay = changeDisplay;
        this.saveSettings = saveSettings;
        this.exitWithoutSaving = exitWithoutSaving;
        this.renderWebhookEdit = renderWebhookEdit;
        this.renderEditCategory = renderEditCategory;
    }
}

export default SettingsServerManager;