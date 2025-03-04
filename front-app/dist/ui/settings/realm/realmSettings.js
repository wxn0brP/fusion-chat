import hub from "../../../hub.js";
hub("realmSettings");
import { setData } from "./rs_var.js";
import { renderMeta } from "./rs_meta.js";
import { renderRoles } from "./rs_roles.js";
import { renderEmojis } from "./rs_emoji.js";
import { renderChannels } from "./rs_channels.js";
import { renderWebhooks } from "./rs_webhooks.js";
import { renderUserRoleManager } from "./rs_users.js";
import { saveSettings, exitWithoutSaving, saveAndExitSettings } from "./rs_save.js";
import { renderCategorySwitcher, changeDisplay } from "./rs_nav.js";
import LangPkg from "../../../utils/translate.js";
class RealmSettingsManager {
    settings;
    saveCallback;
    exitCallback;
    container;
    realmId;
    saveMetaSettings;
    constructor(settings, realmId, container, saveCallback, exitCallback) {
        this.settings = settings;
        this.saveCallback = saveCallback;
        this.exitCallback = exitCallback;
        this.container = container;
        this.realmId = realmId;
        if (!this.settings) {
            console.warn("No settings found");
            return;
        }
        this.container.innerHTML = "";
        setData(this);
    }
    init() {
        if (!this.settings)
            return console.warn("No settings found");
        renderCategorySwitcher();
        renderMeta();
        renderChannels();
        renderRoles();
        renderUserRoleManager();
        renderEmojis();
        renderWebhooks();
        changeDisplay({ meta: true });
        const saveAndExitButton = document.createElement("button");
        saveAndExitButton.textContent = LangPkg.settings.save_and_exit;
        saveAndExitButton.className = "settings__exitButton";
        saveAndExitButton.onclick = () => saveAndExitSettings();
        const saveButton = document.createElement("button");
        saveButton.textContent = LangPkg.settings.save;
        saveButton.className = "settings__exitButton";
        saveButton.onclick = () => saveSettings();
        const exitButton = document.createElement("button");
        exitButton.textContent = LangPkg.settings.exit_without_save;
        exitButton.className = "settings__exitButton";
        exitButton.onclick = () => exitWithoutSaving();
        this.container.appendChild(document.createElement("br"));
        this.container.appendChild(saveAndExitButton);
        this.container.appendChild(saveButton);
        this.container.appendChild(exitButton);
        this.container.fadeIn();
    }
}
export default RealmSettingsManager;
//# sourceMappingURL=realmSettings.js.map