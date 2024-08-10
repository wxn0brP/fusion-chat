class SettingsManager{
    constructor(settings, container, saveCallback, exitCallback){
        this.settings = settings;
        this.saveCallback = saveCallback;
        this.exitCallback = exitCallback;
        this.container = container;
        this.init();
    }

    init(){
        this.container.innerHTML = '';
        const saveFns = [];
        const fns = {
            createButton: this.createButton,
            createCheckbox: this.createCheckbox,
            createTextInput: this.createTextInput,
            createSelectInput: this.createSelectInput,
        }

        this.settings.forEach(category => {
            const categoryDiv = document.createElement('div');
            categoryDiv.className = 'settings__category';
            categoryDiv.innerHTML = `<h1>${category.txt || category.name}</h1>`;
            
            if(category.type == "obj"){
                category.settings.forEach(setting => {
                    const settingElement = document.createElement('div');
                    settingElement.className = 'settings__setting';

                    const label = document.createElement('label');
                    label.textContent = setting.txt || setting.name;
                    label.setAttribute("data-txt", setting.name);
                    settingElement.appendChild(label);

                    let inputElement;

                    switch(setting.type){
                        case 'checkbox':
                            inputElement = this.createCheckbox(setting);
                        break;
                        case 'text':
                            inputElement = this.createTextInput(setting);
                        break;
                        case 'select':
                            inputElement = this.createSelectInput(setting);
                        break;
                        case 'button':
                            inputElement = this.createButton(setting);
                        break;
                        default:
                        break;
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

        const saveButton = document.createElement('button');
        saveButton.textContent = translateFunc.get('Save');
        saveButton.className = 'settings__exitButton';
        saveButton.onclick = () => this.saveSettings(saveFns);

        const exitButton = document.createElement('button');
        exitButton.textContent = translateFunc.get('Exit without save');
        exitButton.className = 'settings__exitButton';
        exitButton.onclick = () => this.exitWithoutSaving();

        this.container.appendChild(document.createElement('br'));
        this.container.appendChild(saveButton);
        this.container.appendChild(exitButton);
        this.container.fadeIn();
    }

    createCheckbox(setting){
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.checked = setting.defaultValue;
        return checkbox;
    }

    createTextInput(setting){
        const input = document.createElement('input');
        input.type = 'text';
        input.value = setting.defaultValue;
        return input;
    }

    createSelectInput(setting){
        const select = document.createElement('select');
        setting.options.forEach(option => {
            const optionElement = document.createElement('option');
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
        const button = document.createElement('button');
        button.textContent = setting.txt || setting.name;
        button.onclick = setting.onclick;
        return button;
    }

    saveSettings(saveFns){
        if(this.saveCallback && typeof this.saveCallback === 'function'){
            const dataStatic = this.getCurrentSettings();
            const datasFn = saveFns.map(saveFn => saveFn.save(saveFn.div));

            const data = Object.assign({}, dataStatic, ...datasFn);
            this.saveCallback(data);
        }
        this.container.innerHTML = '';
        this.container.fadeOut();
    }

    exitWithoutSaving(){
        if(this.exitCallback && typeof this.exitCallback === 'function'){
            this.exitCallback();
        }
        this.container.innerHTML = '';
        this.container.fadeOut();
    }

    getCurrentSettings(){
        const currentSettings = {};
        this.container.querySelectorAll('.settings__setting').forEach(settingElement => {
            const label = settingElement.querySelector('label');
            const input = settingElement.querySelector('input, select, ul');
            if(label && input){
                currentSettings[label.getAttribute('data-txt')] = input.type === 'checkbox' ? input.checked : input.value;
            }
        });
        return currentSettings;
    }
}