SettingsServerManager.prototype.changeDisplay = function(options){
    const displayOptions = {
        meta: false,
        category: false,
        editChannel: false,
        role: false,
        editRole: false,
        usersManager: false,
        ...options
    };

    for(const category in displayOptions){
        const div = this[`${category}Div`];
        div.style.display = displayOptions[category] ? 'block' : 'none';
    }
}

SettingsServerManager.prototype.renderCategorySwitcher = function(){
    const _this = this;
    const categoryButtons =
    [
        { text: translateFunc.get("Basic Settings"), name: 'meta' },
        { text: translateFunc.get("Categories & Channels"), name: 'category' },
        { text: translateFunc.get("Roles"), name: 'role' },
        { text: translateFunc.get("Users Manager"), name: 'usersManager' },
    ]
    .map(category => {
        const button = document.createElement('button');
        button.className = "btn";
        button.textContent = category.text;
        button.onclick = () => {
            _this.changeDisplay({ [category.name]: true });
        };
        return button;
    });

    const categorySwitcherContainer = document.createElement('div');
    categorySwitcherContainer.className = 'settings__categorySwitcher';
    categoryButtons.forEach(button => {
        categorySwitcherContainer.appendChild(button);
    });

    this.container.appendChild(categorySwitcherContainer);
    this.addSeparator(this.container, 20);
}