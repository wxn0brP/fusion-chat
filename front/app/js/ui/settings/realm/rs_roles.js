// @ts-check
import hub from "../../../hub.js";
hub("rs/roles");

import translateFunc from "../../../utils/translate.js";
import permissionFunc, { permissionFlags } from "../../../utils/perm.js";
import vars from "../../../var/var.js";
import genId from "../../../utils/genId.js";
import rs_data from "./rs_var.js";
import debugFunc from "../../../core/debug.js";
import { addSeparator, initButton, initCheckbox, initInputText } from "./rs_utils.js";

export const renderRoles = function(){
    const settings = rs_data.settings;
    if(!settings || !settings.roles) return debugFunc.msg(translateFunc.get("No settings data"));

    const container = rs_data.html.role;
    container.innerHTML = `<h1>${translateFunc.get("Roles")}</h1>`;

    const roles = settings.roles;
    const rolesElements = new Map();

    function repairHierarchy(){
        roles.sort((a, b) => a.lvl - b.lvl).forEach((role, i) => role.lvl = i);
    }
 
    /**
     * Creates a HTML representation for a role in the roles manager.
     * @param {import("./types").Role} role - The role to create the representation for.
     * @param {number} i - The index of the role in the roles array.
     * @returns {void} The HTML representation of the role.
     */
    function renderRole(role, i){
        const details = document.createElement("details");
        rolesElements.set(role._id, details);
        addSeparator(details, 5);

        const summary = document.createElement("summary");
        summary.innerHTML = role.name;
        summary.style.color = role.c ?? "";
        details.appendChild(summary);

        const roleContent = document.createElement("div");
        if(role.p < 0){
            roleContent.innerHTML = translateFunc.get("You can't permissions for edit this role");
        }else{
            const opts = {
                summary
            }
            initButton(details, translateFunc.get("Edit"), () => renderRoleEdit(role, opts));
            if(role.lvl != 0){
                initButton(details, translateFunc.get("Delete"), () => {
                    settings.roles = roles.filter(r => r._id !== role._id);
                    repairHierarchy();
                    renderRoles();
                });
            }
            if(i > 0){
                const prevRole = roles[i - 1];
                if(prevRole.p >= 0){
                    initButton(details, translateFunc.get("Move up"), () => {
                        const _thisLvl = role.lvl;
                        role.lvl = prevRole.lvl;
                        prevRole.lvl = _thisLvl;
                        repairHierarchy();
                        renderRoles();
                    });
                }
            }
            if(i < roles.length - 1){
                initButton(details, translateFunc.get("Move down"), () => {
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
    initButton(container, translateFunc.get("Add"), () => {
        const _id = genId();
        /** @type {import("./types").Role} */
        const role = {
            name: "New role",
            lvl: roles.length,
            p: 0,
            _id
        }
        settings.roles.push(role);
        repairHierarchy();
        renderRoles();
    });

    for(let i=0; i<settings.roles.length; i++){
        renderRole(settings.roles[i], i);
    }
}

/**
 * Renders the edit role interface, allowing users to modify role details
 * such as name, color, and permissions. Provides options to save,
 * cancel, or delete the role. Handles permission settings for each role.
 * 
 * @param {import("./types").Role} role - The role object to edit.
 * @param {Object} opts - An object containing the following properties:
 *                       - {HTMLSummaryElement} summary - The summary element
 *                         associated with the role.
 */
export const renderRoleEdit = function(role, opts){
    const containerElement = rs_data.html.editRole;
    containerElement.innerHTML = `<h1>${translateFunc.get("Edit role")}</h1>`;
    const nameInput = initInputText(containerElement, translateFunc.get("Name"), role.name);

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

    const userPerms = vars.realm.permission;

    permsBuild.forEach(pb => {
        const isPerm = permissionFunc.hasPermission(userPerms, permissionFlags[pb.id]);
        const checkbox = initCheckbox(containerElement, translateFunc.get(pb.name), isPerm);
        checkbox.onchange = () => role.p = caclulatePermissionsByCheckBoxs();
        checkboxs.push({ id: pb.id, checkbox });
    });

    addSeparator(containerElement, 10);
    initButton(containerElement, translateFunc.get("Close"), () => {
        renderRoles();
        containerElement.fadeOut();
    });

    containerElement.fadeIn();
}