import hub from "../../hub.js";
hub("settingsLib");

import translateFunc from "../../utils/translate.js";
import apis from "../../api/apis.js";

class SettingsManager{
    constructor(settings, container, saveCallback, exitCallback){
        this.settings = settings;
        this.saveCallback = saveCallback;
        this.exitCallback = exitCallback;
        this.container = container;
        this.init();
    }

    init(){
        this.container.innerHTML = "";
        const saveFns = [];
        const fns = {
            createButton: this.createButton,
            createCheckbox: this.createCheckbox,
            createTextInput: this.createTextInput,
            createSelectInput: this.createSelectInput,
        }

        function onlyFilter(data){
            return data.filter(setting => {
                if(!setting.only) return true;

                let only = setting.only;
                if(typeof only == "string") only = [only];

                if(!only.includes(apis.app.apiType)) return false;

                return true;
            })
        }

        this.settings = onlyFilter(this.settings);
        this.settings.forEach(setting => {
            if(setting.type != "obj") return;
            setting.settings = onlyFilter(setting.settings);
        })
        
        this.renderCategorySwitcher();

        this.settings.forEach(category => {
            const categoryDiv = document.createElement("div");
            categoryDiv.className = "settings__category";
            categoryDiv.setAttribute("data-id", category.name);
            categoryDiv.innerHTML = `<h1>${category.txt || category.name}</h1>`;
            
            if(category.type == "obj"){
                category.settings.forEach(setting => {
                    const settingElement = document.createElement("div");
                    settingElement.className = "settings__setting";

                    function createLabel(){
                        const label = document.createElement("label");
                        label.textContent = setting.txt || setting.name;
                        label.setAttribute("data-txt", setting.name);
                        settingElement.appendChild(label);
                    }

                    let inputElement;

                    switch(setting.type){
                        case "checkbox":
                            createLabel();
                            inputElement = this.createCheckbox(setting);
                        break;
                        case "text":
                            createLabel();
                            inputElement = this.createTextInput(setting);
                        break;
                        case "select":
                            createLabel();
                            inputElement = this.createSelectInput(setting);
                        break;
                        case "button":
                            inputElement = this.createButton(setting);
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

                    if(inputElement){
                        settingElement.appendChild(inputElement);
                        if(setting.css){
                            inputElement.css(setting.css);
                        }
                    }

                    categoryDiv.appendChild(settingElement);
                });
            }else
            if(category.type == "fn"){
                const div = category.settings(fns);
                categoryDiv.appendChild(div);
                saveFns.push({
                    div,
                    save: category.save
                })
            }

            this.container.appendChild(categoryDiv);
        });

        this.changeDisplay(this.settings[0]?.name);

        const saveButton = document.createElement("button");
        saveButton.textContent = translateFunc.get("Save");
        saveButton.className = "settings__exitButton";
        saveButton.onclick = () => this.saveSettings(saveFns);

        const exitButton = document.createElement("button");
        exitButton.textContent = translateFunc.get("Exit without save");
        exitButton.className = "settings__exitButton";
        exitButton.onclick = () => this.exitWithoutSaving();

        this.container.appendChild(document.createElement("br"));
        this.container.appendChild(saveButton);
        this.container.appendChild(exitButton);
        this.container.fadeIn();
    }

    renderCategorySwitcher(){
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

    changeDisplay(setting){
        const container = this.container;
        this.settings.map(setting => setting.name).forEach(display => {
            const category = container.querySelector(`[data-id="${display}"]`);
            if(!category) return;
            category.style.display = display === setting ? "" : "none";
        });
    }

    createCheckbox(setting){
        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.checked = setting.defaultValue;
        checkbox.classList.add("checkbox_switch");
        return checkbox;
    }

    createTextInput(setting){
        const input = document.createElement("input");
        input.type = "text";
        input.value = setting.defaultValue;
        return input;
    }

    createSelectInput(setting){
        const select = document.createElement("select");
        setting.options.forEach(option => {
            const optionElement = document.createElement("option");
            optionElement.value = option;
            optionElement.textContent = option;
            if(option === setting.defaultValue){
                optionElement.selected = true;
            }
            select.appendChild(optionElement);
        });
        return select;
    }

    createButton(setting){
        const button = document.createElement("button");
        button.textContent = setting.txt || setting.name;
        button.onclick = setting.onclick;
        return button;
    }

    saveSettings(saveFns){
        if(this.saveCallback && typeof this.saveCallback === "function"){
            const dataStatic = this.getCurrentSettings();
            const datasFn = saveFns.map(saveFn => saveFn.save(saveFn.div));

            const data = Object.assign({}, dataStatic, ...datasFn);
            this.saveCallback(data);
        }
        this.container.innerHTML = "";
        this.container.fadeOut();
    }

    exitWithoutSaving(){
        if(this.exitCallback && typeof this.exitCallback === "function"){
            this.exitCallback();
        }
        this.container.innerHTML = "";
        this.container.fadeOut();
    }

    getCurrentSettings(){
        const currentSettings = {};
        this.container.querySelectorAll(".settings__setting").forEach(settingElement => {
            const label = settingElement.querySelector("label");
            const input = settingElement.querySelector("input, select, ul");
            if(label && input){
                currentSettings[label.getAttribute("data-txt")] = input.type === "checkbox" ? input.checked : input.value;
            }
        });
        return currentSettings;
    }
}

export default SettingsManager;