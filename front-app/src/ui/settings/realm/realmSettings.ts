import hub from "../../../hub";
hub("realmSettings");

import Id from "../../../types/Id";
import { setData } from "./rs_var";
import { Settings } from "./types";
import { renderMeta } from "./rs_meta";
import { renderRoles } from "./rs_roles";
import { renderEmojis } from "./rs_emoji";
import { renderChannels } from "./rs_channels";
import { renderWebhooks } from "./rs_webhooks";
import { renderUserRoleManager } from "./rs_users";
import { saveSettings, exitWithoutSaving, saveAndExitSettings } from "./rs_save";
import { renderCategorySwitcher, changeDisplay } from "./rs_nav";
import LangPkg from "../../../utils/translate";

class RealmSettingsManager {
    settings: Settings;
    saveCallback: (settings: Settings) => Promise<boolean>;
    exitCallback: () => void;
    container: HTMLDivElement;
    realmId: Id;
    saveMetaSettings: () => void;

    constructor(settings: Settings, realmId: Id, container: HTMLDivElement, saveCallback: (settings: Settings) => Promise<boolean>, exitCallback: () => void) {
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

    /* init gui elements */

    init() {
        if (!this.settings) return console.warn("No settings found");

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