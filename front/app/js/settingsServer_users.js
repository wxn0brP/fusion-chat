SettingsServerManager.prototype.renderUserRoleManager = function(){
    this.usersManagerDiv.innerHTML = `<h1>${translateFunc.get("Users Manager")}</h1>`;
    const users = this.settings.users;
    const _this = this;

    function renderUser(user){
        const details = document.createElement("details");
        const summary = document.createElement("summary");
        summary.innerHTML = apis.www.changeUserID(user.u);
        details.appendChild(summary);
        const div = document.createElement("div");
        
        const roles = _this.settings.roles;
        const userRoles = user.r;
        const checkboxs = [];
        
        roles.forEach(role => {
            if(!role._id) return;
            const checkbox = _this.initCheckbox(div, role.name, userRoles.includes(role._id));
            checkboxs.push({ id: role._id, checkbox });
        });

        _this.addSeparator(div, 10);
        _this.initButton(div, translateFunc.get("Update"), () => {
            const newRoles = [];
            checkboxs.forEach(c => {
                const { id, checkbox } = c;
                if(checkbox.checked) newRoles.push(id);
            })
            _this.settings.users.find(u => u === user).r = newRoles;
            _this.renderUserRoleManager();
        });

        if(user.u != vars.user._id){
            _this.addSeparator(div, 10);
            _this.initButton(div, translateFunc.get("Kick user"), () => {
                const result = confirm(translateFunc.get("Are you sure you want to kick this user$($)", "? ", apis.www.changeUserID(user.u)));
                if(!result) return;

                _this.settings.users = _this.settings.users.filter(u => u.u !== user.u);
                socket.emit("realm.user.kick", _this.realmId, user.u);
                _this.renderUserRoleManager();
            });

            _this.initButton(div, translateFunc.get("Ban user"), () => {
                const result = confirm(translateFunc.get("Are you sure you want to kick and ban this user$($)", "? ", apis.www.changeUserID(user.u)));
                if(!result) return;

                _this.settings.users = _this.settings.users.filter(u => u.u !== user.u);
                socket.emit("realm.user.kick", _this.realmId, user.u, true);
                _this.renderUserRoleManager();
            });
        }
        
        details.appendChild(div);
        _this.addSeparator(details, 10);
        return details;
    }

    users.forEach(user => {
        this.usersManagerDiv.appendChild(renderUser(user));
        this.addSeparator(this.usersManagerDiv, 10);
    });

    if(this.settings.banUsers.length > 0){
        const banUsersDetails = document.createElement("details");

        const banUsersSummary = document.createElement("summary");
        banUsersSummary.innerHTML = translateFunc.get("Ban users");
        banUsersDetails.appendChild(banUsersSummary);

        this.settings.banUsers.forEach(u => {
            const userName = document.createElement("span");
            userName.innerHTML = apis.www.changeUserID(u);
            banUsersDetails.appendChild(userName);

            this.initButton(banUsersDetails, translateFunc.get("unban user"), () => {
                const result = confirm(translateFunc.get("Are you sure you want to un ban this user? ($)", apis.www.changeUserID(u)));
                if(!result) return;

                _this.settings.banUsers = _this.settings.banUsers.filter(u => u !== u);
                socket.emit("realm.user.unban", _this.realmId, u);
                _this.renderUserRoleManager();
            });
        });

        this.usersManagerDiv.appendChild(banUsersDetails);
    }
}