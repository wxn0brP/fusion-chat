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

        this.metaDiv = this.initCategoryElement();
        this.categoryDiv = this.initCategoryElement();
        this.editChannelDiv = this.initCategoryElement();
        this.roleDiv = this.initCategoryElement();
        this.editRoleDiv = this.initCategoryElement();
        this.userRoleManagerDiv = this.initCategoryElement();

        this.renderMata();
        this.renderChannels();
        this.editChannelDiv.style.display = 'none';
        this.renderRoles();
        this.editRoleDiv.style.display = 'none';
        this.renderUserRoleManager();

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


    /* render gui elements */

    renderMata(){
        const metaDiv = this.metaDiv;
        metaDiv.innerHTML = `<h1>Meta</h1>`;

        const meta = this.settings.meta;
        const nameInput = this.initInputText(metaDiv, 'Name', meta.name);

        this.saveMetaSettings = () => {
            this.settings.meta.name = nameInput.value;
        }
    }

    renderChannels(){
        const categoriesContainer = this.categoryDiv;
        categoriesContainer.innerHTML = '<h1>Categories</h1>';

        const sortedCategories = this.settings.categories.sort((a, b) => a.i - b.i);
        const channels = this.settings.channels;

        this.initButton(categoriesContainer, "Add category", async () => {
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
            categoryDiv.innerHTML = `<span style="font-size: 1.5rem; margin-right: 0.5rem">- ${category.name}</span>`;

            this.initButton(categoryDiv, "Move up", () => {
                if(category.i === 0) return;

                const i = category.i;
                this.settings.categories[i].i = i - 1;
                this.settings.categories[i - 1].i = i;
                this.renderChannels();
            });

            this.initButton(categoryDiv, "Move down", () => {
                if(category.i === sortedCategories.length - 1) return;

                const i = category.i;
                this.settings.categories[i].i = i + 1;
                this.settings.categories[i + 1].i = i;
                this.renderChannels();
            });

            this.initButton(categoryDiv, "Edit", () => {
                categoriesContainer.querySelectorAll('div').forEach(div => div.style.border = "");
                categoryDiv.style.border = "3px dotted var(--accent)";
                this.renderEditCategory(category);
            });

            this.initButton(categoryDiv, "Add channel", async () => {
                const name = await uiFunc.prompt("Enter name");
                const type = await uiFunc.selectPrompt("Enter type", ["text", "voice"]);

                const newChannel = {
                    name: name || "New Channel",
                    type: type || "text",
                    category: category.cid,
                    i: channels.filter(channel => channel.category === category.cid).length
                };
                this.settings.channels.push(newChannel);
                this.renderChannels(); 
            });

            this.addSeparator(categoryDiv, 10);

            const categoryChannels = channels.filter(channel => channel.category === category.cid).sort((a, b) => a.i - b.i);
            categoryChannels.forEach(channel => {
                const channelElement = document.createElement('div');
                channelElement.innerHTML =
                    `<span style="font-size: 1.2rem; margin-right: 0.5rem;">${"&nbsp;".repeat(3)}+ ${channel.name} (${channel.type})</span>`;

                this.initButton(channelElement, "Move up", () => {
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

                this.initButton(channelElement, "Move down", () => {
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

                this.initButton(channelElement, "Edit", () => {
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
        containerElement.innerHTML = '<h1>Edit channel</h1>';

        const nameInp = this.initInputText(containerElement, 'Name', channel.name);

        this.addSeparator(containerElement, 15);
        this.initButton(containerElement, "Save", () => {
            this.settings.channels.find(ch => ch === channel).name = nameInp.value;
            this.renderChannels();
            containerElement.fadeOut();
        });
        this.initButton(containerElement, "Cancel", () => {
            this.renderChannels();
            containerElement.fadeOut();
        });
        this.initButton(containerElement, "Delete", () => {
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
        containerElement.innerHTML = '<h1>Edit category</h1>';

        const nameInput = this.initInputText(containerElement, 'Name', category.name);

        this.addSeparator(containerElement, 15);
        this.initButton(containerElement, "Save", () => {
            this.settings.categories.find(cat => cat === category).name = nameInput.value;
            this.renderChannels();
            containerElement.fadeOut();
        });
        this.initButton(containerElement, "Cancel", () => {
            this.renderChannels();
            containerElement.fadeOut();
        });
        this.initButton(containerElement, "Delete", () => {
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
        container.innerHTML = '<h1>Roles</h1>';

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

        this.initButton(container, "Add role", async () => {
            const name = await uiFunc.prompt("Enter name");
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
            roleDiv.innerHTML = `<span style="font-size: 1.2rem; margin-right: 0.5rem;">- ${role.name}</span>`;

            this.initButton(roleDiv, "Move up", () => {
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

            this.initButton(roleDiv, "Move down", () => {
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

            this.initButton(roleDiv, "Edit", () => {
                container.querySelectorAll('div').forEach(div => div.style.border = "");
                roleDiv.style.border = '3px dotted var(--accent)';
                this.renderRoleEdit(role);
            });

            container.appendChild(roleDiv);
        });
    }

    renderRoleEdit(role){
        const containerElement = this.editRoleDiv;
        containerElement.innerHTML = '<h1>Edit role</h1>';

        const nameInput = this.initInputText(containerElement, 'Name', role.name);
        const checkboxs = new Map();

        if(role.p != "all"){
            this.addSeparator(containerElement, 5);

            const allPerms = [
                "text",
                "voice",
                "manage channels",
                "manage roles",
            ];
            allPerms.forEach(perm => {
                const checkbox = this.initCheckbox(containerElement, perm, role.p.includes(perm));
                checkboxs.set(perm, checkbox);
            });
        }

        this.addSeparator(containerElement, 15);
        this.initButton(containerElement, "Save", () => {
            this.settings.roles.find(r => r === role).name = nameInput.value;

            if(role.p != "all"){
                const newPerms = [];
                checkboxs.forEach((checkbox, perm) => {
                    if(checkbox.checked) newPerms.push(perm);
                })
                this.settings.roles.find(r => r === role).p = newPerms;
            }

            this.renderRoles();
            containerElement.fadeOut();
        });
        this.initButton(containerElement, "Cancel", () => {
            this.renderRoles();
            containerElement.fadeOut();
        });

        if(role.p != "all"){
            this.initButton(containerElement, "Delete", () => {
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
        this.userRoleManagerDiv.innerHTML = '<h1>User roles</h1>';
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

            _this.initButton(div, "Update", () => {
                const newRoles = [];
                checkboxs.forEach(c => {
                    const { id, checkbox } = c;
                    if(checkbox.checked) newRoles.push(id);
                })
                _this.settings.users.find(u => u === user).roles = newRoles;
                _this.renderUserRoleManager();
            });

            details.appendChild(div);
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
        checkboxContainer.innerHTML = `<label>${label}</label>`;
        const inputElement = document.createElement('input');
        inputElement.type = 'checkbox';
        inputElement.checked = defaultValue;
        checkboxContainer.appendChild(inputElement);
        container.appendChild(checkboxContainer);
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