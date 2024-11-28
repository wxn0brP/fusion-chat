SettingsServerManager.prototype.renderRoles = function(){
    const container = this.roleDiv;
    container.innerHTML = `<h1>${translateFunc.get("Roles")}</h1>`;

    const _this = this;
    const roles = this.settings.roles;
    const rolesElements = new Map();

    function repairHierarchy(){
        roles.sort((a, b) => a.lvl - b.lvl).forEach((role, i) => role.lvl = i);
    }
 
    function renderRole(role, i){
        const details = document.createElement("details");
        rolesElements.set(role.id, details);
        _this.addSeparator(details, 5);

        const summary = document.createElement("summary");
        summary.innerHTML = role.name;
        summary.style.color = role.c ?? null;
        details.appendChild(summary);

        const roleContent = document.createElement("div");
        if(role.p < 0){
            roleContent.innerHTML = translateFunc.get("You can't permissions for edit this role");
        }else{
            const opts = {
                summary
            }
            _this.initButton(details, translateFunc.get("Edit"), () => _this.renderRoleEdit(role, opts));
            if(role.lvl != 0){
                _this.initButton(details, translateFunc.get("Delete"), () => {
                    _this.settings.roles = roles.filter(r => r._id !== role._id);
                    repairHierarchy();
                    _this.renderRoles();
                });
            }
            if(i > 0){
                const prevRole = roles[i - 1];
                if(prevRole.p >= 0){
                    _this.initButton(details, translateFunc.get("Move up"), () => {
                        const thisLvl = role.lvl;
                        role.lvl = prevRole.lvl;
                        prevRole.lvl = thisLvl;
                        repairHierarchy();
                        _this.renderRoles();
                    });
                }
            }
            if(i < roles.length - 1){
                _this.initButton(details, translateFunc.get("Move down"), () => {
                    const nextRole = roles[i + 1];
                    const thisLvl = role.lvl;
                    role.lvl = nextRole.lvl;
                    nextRole.lvl = thisLvl;
                    repairHierarchy();
                    _this.renderRoles();
                });
            }
        }
        details.appendChild(roleContent);

        container.appendChild(details);
        _this.addSeparator(details, 5);
    }

    _this.addSeparator(container, 10);
    _this.initButton(container, translateFunc.get("Add"), () => {
        const _id = window.genId();
        _this.settings.roles.push({ name: "New role", lvl: roles.length, p: 0, _id });
        repairHierarchy();
        _this.renderRoles();
    });

    for(let i=0; i<this.settings.roles.length; i++){
        renderRole(this.settings.roles[i], i);
    }
}

SettingsServerManager.prototype.renderRoleEdit = function(role, opts){
    const containerElement = this.editRoleDiv;
    containerElement.innerHTML = `<h1>${translateFunc.get("Edit role")}</h1>`;
    const _this = this;
    const nameInput = this.initInputText(containerElement, translateFunc.get("Name"), role.name);
    nameInput.onchange = () => {
        role.name = nameInput.value;
        opts.summary.innerHTML = role.name;
    }

    this.addSeparator(containerElement, 5);

    const roleColor = document.createElement("input");
    roleColor.type = "color";
    roleColor.value = role.c;
    roleColor.onchange = () => {
        role.c = roleColor.value;
        opts.summary.style.color = role.c ?? null;
    }
    containerElement.appendChild(roleColor);
    this.addSeparator(containerElement, 5);

    function caclulatePermissionsByCheckBoxs(){
        let newPerms = 0;
        checkboxs.forEach(c => {
            const { id, checkbox } = c;
            if(checkbox.checked) newPerms += permissionFlags[id];
        })
        return newPerms;
    }

    const checkboxs = [];
    const permsBuild = [
        { name: "Admin", id: "admin" },
        { name: "Manage messages", id: "manageMessages" },
        { name: "Ban user", id: "banUser" },
        { name: "Mute user", id: "muteUser" },
        { name: "Kick user", id: "kickUser" },
        { name: "Manage roles", id: "manageRoles" },
        { name: "Manage emojis", id: "manageEmojis" },
        { name: "Manage invites", id: "manageInvites" },
        { name: "Manage webhooks", id: "manageWebhooks" },
        { name: "Manage channels", id: "manageChannels" },
    ];

    const userPerms = vars.realm.permissions;

    permsBuild.forEach(pb => {
        const isPerm = permissionFunc.hasPermission(role.p, permissionFlags[pb.id]);
        const checkbox = this.initCheckbox(containerElement, translateFunc.get(pb.name), isPerm);
        if(permissionFunc.hasPermission(userPerms, permissionFlags[pb.id])) checkbox.disabled = true;
        checkbox.onchange = () => role.p = caclulatePermissionsByCheckBoxs();
        checkboxs.push({ id: pb.id, checkbox });
    });

    _this.addSeparator(containerElement, 10);
    _this.initButton(containerElement, translateFunc.get("Close"), () => {
        _this.renderRoles();
        containerElement.fadeOut();
    });

    containerElement.fadeIn();
}