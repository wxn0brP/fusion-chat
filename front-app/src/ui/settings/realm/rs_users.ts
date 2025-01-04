import hub from "../../../hub";
hub("rs/users");

import translateFunc from "../../../utils/translate";
import apis from "../../../api/apis";
import vars from "../../../var/var";
import socket from "../../../core/socket/socket";
import debugFunc from "../../../core/debug";
import rs_dataF from "./rs_var";
import { addSeparator, initButton, initCheckbox } from "./rs_utils";
import { Settings_rs__User } from "./types";

export const renderUserRoleManager = function(){
    const rs_data = rs_dataF();
    const settings = rs_data.settings;
    if(!settings || !settings.users) return debugFunc.msg("No settings data");

    const container = rs_data.html.usersManager;
    container.innerHTML = `<h1>${translateFunc.get("Users Manager")}</h1>`;
    const users = settings.users;
    const roles = settings.roles;

    /**
     * Creates a HTML representation for a user in the users manager.
     */
    function renderUser(user: Settings_rs__User){
        const details = document.createElement("details");
        const summary = document.createElement("summary");
        summary.innerHTML = apis.www.changeUserID(user.u);
        details.appendChild(summary);
        const div = document.createElement("div");
        
        const userRoles = user.r;
        const checkboxs = [];
        
        roles.forEach(role => {
            if(!role._id) return;
            const checkbox = initCheckbox(div, role.name, userRoles.includes(role._id));
            checkboxs.push({ id: role._id, checkbox });
        });

        addSeparator(div, 10);
        initButton(div, translateFunc.get("Update"), () => {
            const newRoles = [];
            checkboxs.forEach(c => {
                const { id, checkbox } = c;
                if(checkbox.checked) newRoles.push(id);
            })
            settings.users.find(u => u === user).r = newRoles;
            renderUserRoleManager();
        });

        if(user.u != vars.user._id){
            addSeparator(div, 10);
            initButton(div, translateFunc.get("Kick user"), () => {
                const result = confirm(translateFunc.get("Are you sure you want to kick _this user$($)", "? ", apis.www.changeUserID(user.u)));
                if(!result) return;

                settings.users = settings.users.filter(u => u.u !== user.u);
                socket.emit("realm.user.kick", rs_data.realmId, user.u);
                renderUserRoleManager();
            });

            initButton(div, translateFunc.get("Ban user"), () => {
                const result = confirm(translateFunc.get("Are you sure you want to kick and ban _this user$($)", "? ", apis.www.changeUserID(user.u)));
                if(!result) return;

                settings.users = settings.users.filter(u => u.u !== user.u);
                socket.emit("realm.user.kick", rs_data.realmId, user.u, true);
                renderUserRoleManager();
            });
        }
        
        details.appendChild(div);
        addSeparator(details, 10);
        return details;
    }

    users.forEach(user => {
        container.appendChild(renderUser(user));
        addSeparator(container, 10);
    });

    if(settings.banUsers.length > 0){
        const banUsersDetails = document.createElement("details");

        const banUsersSummary = document.createElement("summary");
        banUsersSummary.innerHTML = translateFunc.get("Ban users");
        banUsersDetails.appendChild(banUsersSummary);

        settings.banUsers.forEach(u => {
            const userName = document.createElement("span");
            userName.innerHTML = apis.www.changeUserID(u);
            banUsersDetails.appendChild(userName);

            initButton(banUsersDetails, translateFunc.get("unban user"), () => {
                const result = confirm(translateFunc.get("Are you sure you want to un ban _this user? ($)", apis.www.changeUserID(u)));
                if(!result) return;

                settings.banUsers = settings.banUsers.filter(u => u !== u);
                socket.emit("realm.user.unban", rs_data.realmId, u);
                renderUserRoleManager();
            });
        });

        container.appendChild(banUsersDetails);
    }
}