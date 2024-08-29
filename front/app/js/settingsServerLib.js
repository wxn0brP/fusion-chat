class SettingsServerManager{
    constructor(settings, serverId, container, saveCallback, exitCallback){
        this.settings = settings;
        this.saveCallback = saveCallback;
        this.exitCallback = exitCallback;
        this.container = container;
        this.serverId = serverId;
        this.init();
    }

    /* init gui elements */

    init(){
        this.container.innerHTML = '';

        this.renderCategorySwitcher();
        this.metaDiv = this.initCategoryElement();
        this.categoryDiv = this.initCategoryElement();
        this.editChannelDiv = this.initCategoryElement();
        this.roleDiv = this.initCategoryElement();
        this.editRoleDiv = this.initCategoryElement();
        this.usersManagerDiv = this.initCategoryElement();

        this.renderMeta();
        this.renderChannels();
        this.renderRoles();
        this.renderUserRoleManager();
        this.changeDisplay({ meta: true });

        const saveButton = document.createElement('button');
        saveButton.textContent = 'Save';
        saveButton.className = 'settings__exitButton';
        saveButton.onclick = () => this.saveSettings();
        
        const exitButton = document.createElement('button');
        exitButton.textContent = 'Exit without save';
        exitButton.className = 'settings__exitButton';
        exitButton.onclick = () => this.exitWithoutSaving();

        this.container.appendChild(document.createElement('br'));
        this.container.appendChild(saveButton);
        this.container.appendChild(exitButton);
        this.container.fadeIn();
    }
}