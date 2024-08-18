class SettingsServerManager{
    constructor(settings, container, saveCallback, exitCallback){
        this.settings = settings;
        this.saveCallback = saveCallback;
        this.exitCallback = exitCallback;
        this.container = container;
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
        this.userRoleManagerDiv = this.initCategoryElement();

        this.renderMata();
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


    /* GUI navigation */
    changeDisplay(options){
        const displayOptions = {
            meta: false,
            category: false,
            editChannel: false,
            role: false,
            editRole: false,
            userRoleManager: false,
            ...options
        };

        for(const category in displayOptions){
            const div = this[`${category}Div`];
            div.style.display = displayOptions[category] ? 'block' : 'none';
        }
    }

    renderCategorySwitcher(){
        const _this = this;
        const categoryButtons =
        [
            { text: translateFunc.get("Basic Settings"), name: 'meta' },
            { text: translateFunc.get("Categories & Channels"), name: 'category' },
            { text: translateFunc.get("Roles"), name: 'role' },
            { text: translateFunc.get("User Role Manager"), name: 'userRoleManager' },
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


    /* render gui elements */

    renderMata(){
        const metaDiv = this.metaDiv;
        metaDiv.innerHTML = `<h1>${translateFunc.get("Basic Settings")}</h1>`;

        const meta = this.settings.meta;
        const nameInput = this.initInputText(metaDiv, translateFunc.get("Server name"), meta.name);

        this.saveMetaSettings = () => {
            this.settings.meta.name = nameInput.value;
        }
    }

    renderChannels(){
        const categoriesContainer = this.categoryDiv;
        categoriesContainer.innerHTML = `<h1>${translateFunc.get("Categories & Channels")}</h1>`;

        const sortedCategories = this.settings.categories.sort((a, b) => a.i - b.i);
        const channels = this.settings.channels;

        this.initButton(categoriesContainer, translateFunc.get("Add category"), async () => {
            const name = await uiFunc.prompt("Name");

            this.settings.categories.push({
                cid: this.settings.categories.length,
                name: name || "New Category",
                i: this.settings.categories.length
            });
            this.renderChannels();
        })

        sortedCategories.forEach(category => {
            this.addSeparator(categoriesContainer, 15);
            const categoryDiv = document.createElement('div');
            categoryDiv.innerHTML = `<span style="font-size: 1.5rem" class="settings__nameSpan">- ${category.name}</span>`;

            this.initButton(categoryDiv, translateFunc.get("Move up"), () => {
                if(category.i === 0) return;

                const i = category.i;
                this.settings.categories[i].i = i - 1;
                this.settings.categories[i - 1].i = i;
                this.renderChannels();
            });

            this.initButton(categoryDiv, translateFunc.get("Move down"), () => {
                if(category.i === sortedCategories.length - 1) return;

                const i = category.i;
                this.settings.categories[i].i = i + 1;
                this.settings.categories[i + 1].i = i;
                this.renderChannels();
            });

            this.initButton(categoryDiv, translateFunc.get("Edit"), () => {
                categoriesContainer.querySelectorAll('div').forEach(div => div.style.border = "");
                categoryDiv.style.border = "3px dotted var(--accent)";
                this.renderEditCategory(category);
            });

            this.initButton(categoryDiv, translateFunc.get("Add channel"), async () => {
                const name = await uiFunc.prompt(translateFunc.get("Enter name"));
                const type = await uiFunc.selectPrompt(
                    translateFunc.get("Enter type"),
                    [ translateFunc.get("Text"), translateFunc.get("Voice")],
                    ["text", "voice"]
                );

                const newChannel = {
                    name: name || "New Channel",
                    type: type || "text",
                    category: category.cid,
                    i: channels.filter(channel => channel.category === category.cid).length,
                    rp: []
                };
                this.settings.channels.push(newChannel);
                this.renderChannels(); 
            });

            this.addSeparator(categoryDiv, 10);

            const categoryChannels = channels.filter(channel => channel.category === category.cid).sort((a, b) => a.i - b.i);
            categoryChannels.forEach(channel => {
                const channelElement = document.createElement('div');
                channelElement.innerHTML =
                    `<span style="font-size: 1.2rem" class="settings__nameSpan">${"&nbsp;".repeat(3)}+ ${channel.name} (${channel.type})</span>`;

                this.initButton(channelElement, translateFunc.get("Move up"), () => {
                    if(channel.i === 0) return;

                    const i = channel.i;
                    
                    const currentChannelIndex = this.settings.channels.findIndex(ch => {
                        if(ch.category !== channel.category) return false;
                        return ch.i === i;
                    });
                    const previousChannelIndex = this.settings.channels.findIndex(ch => {
                        if(ch.category !== channel.category) return false;
                        return ch.i === i - 1;
                    });

                    if(currentChannelIndex === -1 || previousChannelIndex === -1) return;
                    this.settings.channels[currentChannelIndex].i = i - 1;
                    this.settings.channels[previousChannelIndex].i = i;

                    this.renderChannels();
                });

                this.initButton(channelElement, translateFunc.get("Move down"), () => {
                    if(channel.i >= categoryChannels.length - 1) return;

                    const i = channel.i;

                    const currentChannelIndex = this.settings.channels.findIndex(ch => {
                        if(ch.category !== channel.category) return false;
                        return ch.i === i;
                    });
                    const nextChannelIndex = this.settings.channels.findIndex(ch => {
                        if(ch.category !== channel.category) return false;
                        return ch.i === i + 1;
                    });

                    if(currentChannelIndex === -1 || nextChannelIndex === -1) return;
                    this.settings.channels[currentChannelIndex].i = i + 1;
                    this.settings.channels[nextChannelIndex].i = i;

                    this.renderChannels();
                });

                this.initButton(channelElement, translateFunc.get("Edit"), () => {
                    categoriesContainer.querySelectorAll('div').forEach(div => div.style.border = "");
                    channelElement.style.border = "3px dotted var(--accent)";
                    this.renderEditChannel(channel); 
                });

                categoryDiv.appendChild(channelElement);
                this.addSeparator(categoryDiv, 10);
            });

            categoriesContainer.appendChild(categoryDiv);
        });
    }

    renderEditChannel(channel){
        const containerElement = this.editChannelDiv;
        containerElement.innerHTML = `<h1>${translateFunc.get("Edit channel")}</h1>`;

        const nameInp = this.initInputText(containerElement, translateFunc.get("Name"), channel.name);
        const _this = this;

        const allPerm = [
            { name: translateFunc.get("Write messages"), id: "text" },
            { name: translateFunc.get("Show channel"), id: "visable" },
        ];

        function renderRole(role){
            const details = document.createElement('details');
            const summary = document.createElement('summary');
            summary.innerHTML = role.name;
            details.appendChild(summary);

            allPerm.forEach(perm => {
                const checkbox = _this.initCheckbox(details, perm.name, false);
                checkbox.checked = channel.rp.includes(role.rid + "/" + perm.id);
                checkbox.setAttribute('data-role', role.rid);
                checkbox.setAttribute('data-perm', perm.id);
            });
            containerElement.appendChild(details);
            _this.addSeparator(details, 5);
        }

        this.settings.roles.forEach(renderRole);

        this.addSeparator(containerElement, 15);
        this.initButton(containerElement, translateFunc.get("Save"), () => {
            channel.name = nameInp.value;
            channel.rp = [];

            containerElement.querySelectorAll("input[type=checkbox][data-role][data-perm]").forEach(checkbox => {
                if(!checkbox.checked) return;
                const role = checkbox.getAttribute('data-role');
                const perm = checkbox.getAttribute('data-perm');
                channel.rp.push(role + "/" + perm);
            });

            this.renderChannels();
            containerElement.fadeOut();
        });
        this.initButton(containerElement, translateFunc.get("Cancel"), () => {
            this.renderChannels();
            containerElement.fadeOut();
        });
        this.initButton(containerElement, translateFunc.get("Delete"), () => {
            const index = this.settings.channels.findIndex(ch => ch === channel);
            if(index !== -1){
                this.settings.channels.splice(index, 1);
                this.renderChannels();
                containerElement.fadeOut();
            }
        });

        containerElement.fadeIn();
    }

    renderEditCategory(category){
        const containerElement = this.editChannelDiv;
        containerElement.innerHTML = `<h1>${translateFunc.get("Edit category")}</h1>`;

        const nameInput = this.initInputText(containerElement, translateFunc.get("Name"), category.name);

        this.addSeparator(containerElement, 15);
        this.initButton(containerElement, translateFunc.get("Save"), () => {
            this.settings.categories.find(cat => cat === category).name = nameInput.value;
            this.renderChannels();
            containerElement.fadeOut();
        });
        this.initButton(containerElement, translateFunc.get("Cancel"), () => {
            this.renderChannels();
            containerElement.fadeOut();
        });
        this.initButton(containerElement, translateFunc.get("Delete"), () => {
            const index = this.settings.categories.findIndex(cat => cat.cid === category.cid);
            if(index !== -1){
                this.settings.categories.splice(index, 1);
                this.renderChannels();
                containerElement.fadeOut();
            }
        });

        containerElement.fadeIn();
    }

    renderRoles(){
        const container = this.roleDiv;
        container.innerHTML = `<h1>${translateFunc.get("Roles")}</h1>`;

        /* 
            role structure:
            {
                name: string,
                rid: string, // role id
                p: string[], // permissions
                parent: string // parent role id
            }
        */

        this.settings.roles = this.sortRoles(this.settings.roles);
        const roles = this.settings.roles;

        this.initButton(container, translateFunc.get("Add role"), async () => {
            const name = await uiFunc.prompt(translateFunc.get("Enter name"));
            const newRole = {
                name: name || "New Role",
                rid: roles.length,
                p: [],
                parent: roles[roles.length - 1].rid
            }
            roles.push(newRole);
            this.renderRoles();
        });
        this.addSeparator(container, 15);

        roles.forEach((role, index) => {
            this.addSeparator(container, 10);
            const roleDiv = document.createElement('div');
            roleDiv.innerHTML = `<span style="font-size: 1.2rem" class="settings__nameSpan">- ${role.name}</span>`;

            this.initButton(roleDiv, translateFunc.get("Move up"), () => {
                if(index === 0) return;

                const nadPar = roles[index - 1].parent;
                const nadId  = roles[index - 1].rid;
                const rol    = roles[index]    .rid;

                roles[index - 1].parent = rol;
                roles[index].parent = nadPar;
                if(index < roles.length - 1)
                    roles[index + 1].parent = nadId;  
                
                this.renderRoles();
            });

            this.initButton(roleDiv, translateFunc.get("Move down"), () => {
                if(index >= roles.length - 1) return;

                const rolPar = roles[index]    .parent;
                const rolId  = roles[index]    .rid;
                const par1   = roles[index + 1].rid;

                roles[index]    .parent = par1;
                roles[index + 1].parent = rolPar;
                if(index < roles.length - 2)
                    roles[index + 2].parent = rolId;

                this.renderRoles();
            });

            this.initButton(roleDiv, translateFunc.get("Edit"), () => {
                container.querySelectorAll('div').forEach(div => div.style.border = "");
                roleDiv.style.border = '3px dotted var(--accent)';
                this.renderRoleEdit(role);
            });

            container.appendChild(roleDiv);
        });
    }

    renderRoleEdit(role){
        const containerElement = this.editRoleDiv;
        containerElement.innerHTML = `<h1>${translateFunc.get("Edit role")}</h1>`;

        const nameInput = this.initInputText(containerElement, translateFunc.get("Name"), role.name);
        const checkboxs = new Map();

        if(role.p != "all"){
            this.addSeparator(containerElement, 5);

            const allPerms = [
                { name: translateFunc.get("Write messages"), id: "text" },
                { name: translateFunc.get("Join to voice channels"), id: "voice" },
                { name: translateFunc.get("Manage messages"), id: "manage text" },
                { name: translateFunc.get("Manage server settings"), id: "manage server" },
            ];
            allPerms.forEach(perm => {
                const checkbox = this.initCheckbox(containerElement, perm.name, role.p.includes(perm.id));
                checkboxs.set(perm.id, checkbox);
            });
        }

        this.addSeparator(containerElement, 5);
        const colorInput = document.createElement('input');
        colorInput.type = 'color';
        colorInput.value = role.color || "white";
        containerElement.appendChild(colorInput);

        this.addSeparator(containerElement, 15);
        this.initButton(containerElement, translateFunc.get("Save"), () => {
            role.name = nameInput.value;
            role.color = colorInput.value;

            if(role.p != "all"){
                const newPerms = [];
                checkboxs.forEach((checkbox, perm) => {
                    if(checkbox.checked) newPerms.push(perm);
                })
                role.p = newPerms;
            }

            this.renderRoles();
            containerElement.fadeOut();
        });
        this.initButton(containerElement, translateFunc.get("Cancel"), () => {
            this.renderRoles();
            containerElement.fadeOut();
        });

        if(role.p != "all"){
            this.initButton(containerElement, translateFunc.get("Delete"), () => {
                const index = this.settings.roles.findIndex(r => r.rid === role.rid);
                if(index !== -1){
                    if(index < this.settings.roles.length - 1){
                        this.settings.roles[index + 1].parent = role.parent;
                    }
                    this.settings.roles.splice(index, 1);
                    this.renderRoles();
                    containerElement.fadeOut();
                }
            });
        }
        containerElement.fadeIn();
    }

    renderUserRoleManager(){
        this.userRoleManagerDiv.innerHTML = `<h1>${translateFunc.get("User Roles Manager")}</h1>`;
        const users = this.settings.users;
        const _this = this;
        function renderUser(user){
            const details = document.createElement('details');
            const summary = document.createElement('summary');
            summary.innerHTML = apis.www.changeUserID(user.uid);
            details.appendChild(summary);
            const div = document.createElement('div');
            
            const roles = _this.settings.roles;
            const userRoles = user.roles;
            const checkboxs = [];
            
            roles.forEach(role => {
                const roleDiv = document.createElement('div');
                const checkbox = _this.initCheckbox(roleDiv, role.name, userRoles.includes(role.rid));
                checkboxs.push({id: role.rid, checkbox});
                div.appendChild(roleDiv);
            });
            _this.addSeparator(div, 10);
            _this.initButton(div, translateFunc.get("Update"), () => {
                const newRoles = [];
                checkboxs.forEach(c => {
                    const { id, checkbox } = c;
                    if(checkbox.checked) newRoles.push(id);
                })
                _this.settings.users.find(u => u === user).roles = newRoles;
                _this.renderUserRoleManager();
            });
            
            details.appendChild(div);
            _this.addSeparator(details, 10);
            return details;
        }
        users.forEach(user => {
            this.userRoleManagerDiv.appendChild(renderUser(user));
        });
    }

    /* logic */

    saveSettings(){
        this.container.fadeOut();
        if(!this.saveCallback && typeof this.saveCallback !== 'function'){
            this.container.innerHTML = '';
            return;
        }
        
        this.saveMetaSettings();
        this.saveCallback(this.settings);
        
        this.container.innerHTML = '';
    }

    exitWithoutSaving(){
        if(this.exitCallback && typeof this.exitCallback === 'function'){
            this.exitCallback();
        }
        this.container.fadeOut();
        this.container.innerHTML = '';
    }

    initCategoryElement(){
        const div = document.createElement('div');
        div.className = 'settings__category';
        this.container.appendChild(div);
        return div;
    }

    initInputText(container, label, defaultValue){
        const textInputContainer = document.createElement('div');
        textInputContainer.innerHTML = `<label>${label}</label>`;
        const inputElement = document.createElement('input');
        inputElement.type = 'text';
        inputElement.value = defaultValue;
        textInputContainer.appendChild(inputElement);
        container.appendChild(textInputContainer);
        return inputElement;
    }

    initButton(container, text, onclick){
        const button = document.createElement('button');
        button.innerHTML = text;
        button.onclick = onclick;
        button.style.marginInline = "3px";
        container.appendChild(button);
        return button;
    }

    initCheckbox(container, label, defaultValue){
        const checkboxContainer = document.createElement('div');
        const inputElement = document.createElement('input');
        inputElement.type = 'checkbox';
        inputElement.checked = defaultValue;
        checkboxContainer.appendChild(inputElement);
        container.appendChild(checkboxContainer);
        checkboxContainer.innerHTML += `<label>${label}</label>`;
        return inputElement;
    }

    addSeparator(container, x){
        const div = document.createElement('div');
        div.style.height = x+"px";
        container.appendChild(div);
    }

    sortRoles(rolesArray){
        const sortedRoles = [];
        const seenRoleIds = {};
        const seenParents = {};
    
        for(const role of rolesArray){
            if(seenRoleIds[role.rid] || seenParents[role.parent]) return false;
            seenRoleIds[role.rid] = true;
            seenParents[role.parent] = true;
        }
    
        const topLevelRole = rolesArray.find(role => role.parent === "all");
    
        function traverseAndSort(role){
            sortedRoles.push(role);
            const childRole = rolesArray.find(child => child.parent === role.rid);
    
            if(childRole) traverseAndSort(childRole);
        }
    
        if(topLevelRole) traverseAndSort(topLevelRole);
        else return false;
    
        return sortedRoles;
    }
}