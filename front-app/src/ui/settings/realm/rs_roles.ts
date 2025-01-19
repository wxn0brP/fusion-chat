import hub from "../../../hub";
hub("rs/roles");

import permissionFunc from "../../../utils/perm";
import vars from "../../../var/var";
import genId from "../../../utils/genId";
import rs_dataF from "./rs_var";
import debugFunc from "../../../core/debug";
import { addSeparator, initButton, initCheckbox, initInputText } from "./rs_utils";
import { Settings_rs__Role } from "./types";
import LangPkg from "../../../utils/translate";

export const renderRoles = function () {
    const rs_data = rs_dataF();
    const settings = rs_data.settings;
    if (!settings || !settings.roles) return debugFunc.msg(LangPkg.settings_realm.no_data);

    const container = rs_data.html.role;
    container.innerHTML = `<h1>${LangPkg.settings_realm.roles}</h1>`;

    const roles = settings.roles;
    const rolesElements = new Map();

    function repairHierarchy() {
        roles.sort((a, b) => a.lvl - b.lvl).forEach((role, i) => role.lvl = i);
    }

    /**
     * Creates a HTML representation for a role in the roles manager.
     */
    function renderRole(role: Settings_rs__Role, i: number) {
        const details = document.createElement("details");
        rolesElements.set(role._id, details);
        addSeparator(details, 5);

        const summary = document.createElement("summary");
        summary.innerHTML = role.name;
        summary.style.color = role.c ?? "";
        details.appendChild(summary);

        const roleContent = document.createElement("div");
        if (role.p < 0) {
            roleContent.innerHTML = LangPkg.settings_realm.no_perm_to_edit_role;
        } else {
            const opts = {
                summary
            }
            initButton(details, LangPkg.uni.edit, () => renderRoleEdit(role, opts));
            if (role.lvl != 0) {
                initButton(details, LangPkg.uni.delete, () => {
                    settings.roles = roles.filter(r => r._id !== role._id);
                    repairHierarchy();
                    renderRoles();
                });
            }
            if (i > 0) {
                const prevRole = roles[i - 1];
                if (prevRole.p >= 0) {
                    initButton(details, LangPkg.settings_realm.move_up, () => {
                        const _thisLvl = role.lvl;
                        role.lvl = prevRole.lvl;
                        prevRole.lvl = _thisLvl;
                        repairHierarchy();
                        renderRoles();
                    });
                }
            }
            if (i < roles.length - 1) {
                initButton(details, LangPkg.settings_realm.move_down, () => {
                    const nextRole = roles[i + 1];
                    const _thisLvl = role.lvl;
                    role.lvl = nextRole.lvl;
                    nextRole.lvl = _thisLvl;
                    repairHierarchy();
                    renderRoles();
                });
            }
        }
        details.appendChild(roleContent);

        container.appendChild(details);
        addSeparator(details, 5);
    }

    addSeparator(container, 10);
    initButton(container, LangPkg.uni.add, () => {
        const _id = genId();
        const role: Settings_rs__Role = {
            name: "New role",
            lvl: roles.length,
            p: 0,
            _id
        }
        settings.roles.push(role);
        repairHierarchy();
        renderRoles();
    });

    for (let i = 0; i < settings.roles.length; i++) {
        renderRole(settings.roles[i], i);
    }
}

/**
 * Renders the edit role interface, allowing users to modify role details
 * such as name, color, and permissions. Provides options to save,
 * cancel, or delete the role. Handles permission settings for each role.
 */
export const renderRoleEdit = function (role: Settings_rs__Role, opts: { summary: HTMLElement }) {
    const containerElement = rs_dataF().html.editRole;
    containerElement.innerHTML = `<h1>${LangPkg.settings_realm.edit_role}</h1>`;
    const nameInput = initInputText(containerElement, LangPkg.settings.name, role.name);

    nameInput.onchange = () => {
        role.name = nameInput.value;
        opts.summary.innerHTML = role.name;
    }

    addSeparator(containerElement, 5);

    const roleColor = document.createElement("input");
    roleColor.type = "color";
    roleColor.value = role.c || "";
    roleColor.onchange = () => {
        role.c = roleColor.value;
        opts.summary.style.color = role.c ?? null;
    }
    containerElement.appendChild(roleColor);
    addSeparator(containerElement, 5);

    function caclulatePermissionsByCheckBoxs() {
        let newPerms = 0;
        checkboxs.forEach((c, i) => {
            if (c.checked) newPerms += (1 << i);
        })
        return newPerms;
    }

    const checkboxs = [];
    const permsBuild = [
        "admin",
        "manage_messages",
        "ban_user",
        "mute_user",
        "kick_user",
        "manage_roles",
        "manage_emojis",
        "manage_invites",
        "manage_webhooks",
        "manage_channels",
    ];

    const userPermissions = vars.realm.permission || 0;

    permsBuild.forEach((pb, i) => {
        const isPerm = permissionFunc.hasPermission(role.p, (1 << i));
        const checkbox = initCheckbox(containerElement, LangPkg.settings_realm.role_permissions[pb], isPerm);

        // if user not has permission, don't allow to change
        if(permissionFunc.hasPermission(userPermissions, (1 << i)))
            checkbox.onchange = () => role.p = caclulatePermissionsByCheckBoxs();
        else{
            checkbox.disabled = true;
            const label = checkbox.nextElementSibling as HTMLLabelElement;
            label.style.textDecoration = "line-through";
        }
        
        checkboxs.push(checkbox);
    });

    addSeparator(containerElement, 10);
    initButton(containerElement, LangPkg.uni.close, () => {
        renderRoles();
        containerElement.fadeOut();
    });

    containerElement.fadeIn();
}