import hub from "../../../hub.js";
hub("realmSettings");

import translateFunc from "../../../utils/translate.js";
import rs_data, { setData} from "./rs_var.js";
import { renderMeta } from "./rs_meta.js";
import { renderEmojis } from "./rs_emoji.js";
import { renderUserRoleManager } from "./rs_users.js";
import { renderRoles } from "./rs_roles.js";
import { saveSettings, exitWithoutSaving } from "./rs_save.js";
import { renderCategorySwitcher, changeDisplay } from "./rs_nav.js";
import { renderWebhooks } from "./rs_webhooks.js";
import { renderChannels } from "./rs_channels.js";

class RealmSettingsManager{
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
        this.rs = rs_data;
        setData(this);

        renderCategorySwitcher();

        renderMeta();
        renderChannels();
        renderRoles();
        renderUserRoleManager();
        renderEmojis();
        renderWebhooks();
        changeDisplay({ meta: true });

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
        this.saveSettings = saveSettings;
        this.exitWithoutSaving = exitWithoutSaving;
    }
}

export default RealmSettingsManager;