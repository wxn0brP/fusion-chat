import hub from "../../../hub.js";
hub("rs/users");
import apis from "../../../api/apis.js";
import vars from "../../../var/var.js";
import socket from "../../../core/socket/socket.js";
import debugFunc, { LogLevel } from "../../../core/debug.js";
import rs_dataF from "./rs_var.js";
import { addSeparator, initButton, initCheckbox } from "./rs_utils.js";
import LangPkg, { langFunc } from "../../../utils/translate.js";
import uiFunc from "../../helpers/uiFunc.js";
export const renderUserRoleManager = function () {
    const rs_data = rs_dataF();
    const settings = rs_data.settings;
    if (!settings || !settings.users)
        return debugFunc.msg(LogLevel.ERROR, LangPkg.settings_realm.no_data);
    const container = rs_data.html.usersManager;
    container.innerHTML = `<h1>${LangPkg.settings_realm.users_manager}</h1>`;
    const users = settings.users;
    const roles = settings.roles;
    function renderUser(user) {
        const details = document.createElement("details");
        const summary = document.createElement("summary");
        summary.innerHTML = apis.www.changeUserID(user.u);
        details.appendChild(summary);
        const div = document.createElement("div");
        const userRoles = user.r;
        const checkboxs = [];
        roles.forEach(role => {
            if (!role._id)
                return;
            const checkbox = initCheckbox(div, role.name, userRoles.includes(role._id));
            checkboxs.push({ id: role._id, checkbox });
        });
        addSeparator(div, 10);
        initButton(div, LangPkg.uni.update, () => {
            const newRoles = [];
            checkboxs.forEach(c => {
                const { id, checkbox } = c;
                if (checkbox.checked)
                    newRoles.push(id);
            });
            settings.users.find(u => u === user).r = newRoles;
            renderUserRoleManager();
        });
        if (user.u != vars.user._id) {
            addSeparator(div, 10);
            initButton(div, LangPkg.settings_realm.role_permissions.kick_user, async () => {
                const text = langFunc(LangPkg.settings_realm.user_mgmt_confirms.kick_sure, apis.www.changeUserID(user.u)) + "?";
                const conf = await uiFunc.confirm(text);
                if (!conf)
                    return;
                settings.users = settings.users.filter(u => u.u !== user.u);
                socket.emit("realm.user.kick", rs_data.realmId, user.u);
                renderUserRoleManager();
            });
            initButton(div, LangPkg.settings_realm.role_permissions.ban_user, async () => {
                const text = langFunc(LangPkg.settings_realm.user_mgmt_confirms.ban_sure, apis.www.changeUserID(user.u)) + "?";
                const conf = await uiFunc.confirm(text);
                if (!conf)
                    return;
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
    if (settings.banUsers.length > 0) {
        const banUsersDetails = document.createElement("details");
        const banUsersSummary = document.createElement("summary");
        banUsersSummary.innerHTML = LangPkg.settings_realm.banned_users;
        banUsersDetails.appendChild(banUsersSummary);
        settings.banUsers.forEach(u => {
            const userName = document.createElement("span");
            userName.innerHTML = apis.www.changeUserID(u);
            banUsersDetails.appendChild(userName);
            initButton(banUsersDetails, LangPkg.settings_realm.unban_user, async () => {
                const text = langFunc(LangPkg.settings_realm.user_mgmt_confirms.unban_sure, apis.www.changeUserID(u)) + "?";
                const conf = await uiFunc.confirm(text);
                if (!conf)
                    return;
                settings.banUsers = settings.banUsers.filter(u => u !== u);
                socket.emit("realm.user.unban", rs_data.realmId, u);
                renderUserRoleManager();
            });
        });
        container.appendChild(banUsersDetails);
    }
};
//# sourceMappingURL=rs_users.js.map