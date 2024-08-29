SettingsServerManager.prototype.renderRoles = function(){
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

SettingsServerManager.prototype.renderRoleEdit = function(role){
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