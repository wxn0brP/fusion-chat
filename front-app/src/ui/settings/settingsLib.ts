import hub from "../../hub";
hub("settingsLib");

import apis from "../../api/apis";
import LangPkg from "../../utils/translate";
import {
    Settings_settingsManager__category,
    Settings_settingsManager__fns,
    Settings_settingsManager__saveFn,
    Settings_settingsManager__settings,
    Settings_settingsManager__settings_button,
    Settings_settingsManager__settings_checkbox,
    Settings_settingsManager__settings_select,
    Settings_settingsManager__settings_text
} from "../../types/ui/settings";

const fns: Settings_settingsManager__fns = {
    createCheckbox(setting: Settings_settingsManager__settings_checkbox) {
        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.checked = setting.defaultValue;
        checkbox.classList.add("checkbox_switch");
        return checkbox;
    },

    createTextInput(setting: Settings_settingsManager__settings_text) {
        const input = document.createElement("input");
        input.type = "text";
        input.value = setting.defaultValue;
        return input;
    },

    createSelectInput(setting: Settings_settingsManager__settings_select) {
        const select = document.createElement("select");
        setting.options.forEach(option => {
            const optionElement = document.createElement("option");
            optionElement.value = option;
            optionElement.textContent = option;
            if (option === setting.defaultValue) {
                optionElement.selected = true;
            }
            select.appendChild(optionElement);
        });
        return select;
    },

    createButton(setting: Settings_settingsManager__settings_button) {
        const button = document.createElement("button");
        button.textContent = setting.txt || setting.name;
        button.onclick = setting.onclick;
        return button;
    }
}

class SettingsManager {
    settings: Settings_settingsManager__category[];
    saveCallback: (settings: Settings_settingsManager__category) => void;
    exitCallback: () => void;
    container: HTMLDivElement;

    constructor(settings: Settings_settingsManager__category[], container: HTMLDivElement, saveCallback: (settings: Settings_settingsManager__category) => void, exitCallback: () => void) {
        this.settings = settings;
        this.saveCallback = saveCallback;
        this.exitCallback = exitCallback;
        this.container = container;
        this.init();
    }

    init() {
        this.container.innerHTML = "";
        const saveFns: Settings_settingsManager__saveFn[] = [];

        function onlyFilter(data: { only?: string | string[] }[]): any[] {
            return data.filter(setting => {
                if (!setting.only) return true;

                let only = setting.only;
                if (typeof only == "string") only = [only];

                if (!only.includes(apis.app.apiType)) return false;

                return true;
            })
        }

        this.settings = onlyFilter(this.settings);
        this.settings.forEach(setting => {
            if (setting.type != "obj") return;
            // @ts-ignore
            // TODO fix type
            setting.settings = onlyFilter(setting.settings);
        })

        this.renderCategorySwitcher();

        this.settings.forEach(category => {
            const categoryDiv = document.createElement("div");
            categoryDiv.className = "settings__category";
            categoryDiv.setAttribute("data-id", category.name);
            categoryDiv.innerHTML = `<h1>${category.txt || category.name}</h1>`;

            if (category.type == "obj") {
                category.settings.forEach((setting: Settings_settingsManager__settings) => {
                    const settingElement = document.createElement("div");
                    settingElement.className = "settings__setting";

                    function createLabel() {
                        const label = document.createElement("label");
                        label.textContent = setting.txt || setting.name;
                        label.setAttribute("data-txt", setting.name);
                        settingElement.appendChild(label);
                    }

                    let inputElement;

                    switch (setting.type) {
                        case "checkbox":
                            createLabel();
                            inputElement = fns.createCheckbox(setting);
                            break;
                        case "text":
                            createLabel();
                            inputElement = fns.createTextInput(setting);
                            break;
                        case "select":
                            createLabel();
                            inputElement = fns.createSelectInput(setting);
                            break;
                        case "button":
                            inputElement = fns.createButton(setting);
                            break;
                        case "hr":
                            inputElement = document.createElement("hr");
                            break;
                        case "h1":
                        case "h2":
                        case "h3":
                        case "h4":
                        case "h5":
                        case "h6":
                        case "p":
                            inputElement = document.createElement(setting.type);
                            inputElement.textContent = setting.txt || setting.name;
                            break;
                        default:
                            createLabel();
                    }

                    if (inputElement) {
                        settingElement.appendChild(inputElement);
                        if (setting.css) {
                            inputElement.css(setting.css);
                        }
                    }

                    categoryDiv.appendChild(settingElement);
                });
            } else
                if (category.type == "fn") {
                    const [div, tmpData] = category.settings(fns);
                    categoryDiv.appendChild(div);
                    saveFns.push({
                        div,
                        save: category.save,
                        tmpData
                    })
                }

            this.container.appendChild(categoryDiv);
        });

        this.changeDisplay(this.settings[0]?.name);

        const saveButton = document.createElement("button");
        saveButton.textContent = LangPkg.settings.save;
        saveButton.className = "settings__exitButton";
        saveButton.onclick = () => this.saveSettings(saveFns);

        const exitButton = document.createElement("button");
        exitButton.textContent = LangPkg.settings.exit_without_save;
        exitButton.className = "settings__exitButton";
        exitButton.onclick = () => this.exitWithoutSaving();

        this.container.appendChild(document.createElement("br"));
        this.container.appendChild(saveButton);
        this.container.appendChild(exitButton);
        this.container.fadeIn();
    }

    renderCategorySwitcher() {
        const categorySwitcher = document.createElement("div");
        categorySwitcher.className = "settings__categorySwitcher";

        const displays = this.settings.map(setting => setting.name);
        displays.forEach(display => {
            const button = document.createElement("button");
            button.textContent = display;
            button.className = "btn";
            button.onclick = () => this.changeDisplay(display);
            categorySwitcher.appendChild(button);
        });

        this.container.appendChild(categorySwitcher);
    }

    changeDisplay(setting: string) {
        const container = this.container;
        this.settings.map(setting => setting.name).forEach(display => {
            const category = container.querySelector<HTMLDivElement>(`[data-id="${display}"]`);
            if (!category) return;
            category.style.display = display === setting ? "" : "none";
        });
    }

    saveSettings(saveFns: Settings_settingsManager__saveFn[]) {
        if (this.saveCallback && typeof this.saveCallback === "function") {
            const dataStatic = this.getCurrentSettings();
            const datasFn = saveFns.map(saveFn => saveFn.save(saveFn.div, saveFn.tmpData));

            const data = Object.assign({}, dataStatic, ...datasFn);
            this.saveCallback(data);
        }
        this.container.innerHTML = "";
        this.container.fadeOut();
    }

    exitWithoutSaving() {
        if (this.exitCallback && typeof this.exitCallback === "function") {
            this.exitCallback();
        }
        this.container.innerHTML = "";
        this.container.fadeOut();
    }

    getCurrentSettings() {
        const currentSettings = {};
        this.container.querySelectorAll(".settings__setting").forEach(settingElement => {
            const label = settingElement.querySelector("label");
            const input = settingElement.querySelector("input, select, ul") as HTMLInputElement;
            if (label && input) {
                const data = input.type === "checkbox" ? input.checked : input.value;
                currentSettings[label.getAttribute("data-txt")] = data;
            }
        });
        return currentSettings;
    }
}

export default SettingsManager;