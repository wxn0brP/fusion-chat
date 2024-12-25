// @ts-check
import hub from "../../../hub.js";
hub("rs/nav");

import translateFunc from "../../../utils/translate.js";
import vars from "../../../var/var.js";
import permissionFunc, { permissionFlags } from "../../../utils/perm.js";
import socket from "../../../core/socket/socket.js";
import rs_data from "./rs_var.js";

import { renderMeta } from "./rs_meta.js";
import { renderWebhooks } from "./rs_webhooks.js";
import { renderEmojis } from "./rs_emoji.js";
import { renderUserRoleManager } from "./rs_users.js";
import { renderRoles } from "./rs_roles.js";
import { renderChannels } from "./rs_channels.js";
import { addSeparator } from "./rs_utils.js";


/**
 * Updates the display status of various sections in the UI based on the provided options.
 * Each section can be toggled between "block" and "none" display styles.
 * 
 * @param {Object} options - An object containing boolean values for each section indicating
 *                           whether the section should be displayed or hidden.
 * @param {boolean} [options.meta] - Display status for the meta section.
 * @param {boolean} [options.category] - Display status for the category section.
 * @param {boolean} [options.editChannel] - Display status for the edit channel section.
 * @param {boolean} [options.role] - Display status for the role section.
 * @param {boolean} [options.editRole] - Display status for the edit role section.
 * @param {boolean} [options.usersManager] - Display status for the users manager section.
 * @param {boolean} [options.emoji] - Display status for the emoji section.
 * @param {boolean} [options.webhook] - Display status for the webhook section.
 * @param {boolean} [options.editWebhook] - Display status for the edit webhook section.
 */

export const changeDisplay = function(options){
    const displayOptions = {
        meta: false,
        category: false,
        editChannel: false,
        role: false,
        editRole: false,
        usersManager: false,
        emoji: false,
        webhook: false,
        editWebhook: false,
        ...options
    };

    for(const category in displayOptions){
        const div = rs_data.html[category];
        div.style.display = displayOptions[category] ? "block" : "none";
    }
}

/**
 * Renders a container with buttons for each section of the realm settings.
 * Each button, when clicked, will toggle the display of the corresponding section.
 * 
 * The sections available are:
 * - Basic Settings
 * - Categories & Channels
 * - Roles
 * - Users Manager
 * - Emoji Manager
 * - Webhooks
 * 
 * Note that some sections may be hidden or disabled based on the user's permissions.
 */
export const renderCategorySwitcher = function(){
    const settings = rs_data.settings;

    const isAdmin = permissionFunc.hasPermission(vars.realm.permission, permissionFlags.admin);
    const categoryButtons =
    [
        {
            text: translateFunc.get("Basic Settings"),
            name: "meta",
            req: ["meta"],
            p: permissionFlags.admin,
            render: renderMeta
        },
        {
            text: translateFunc.get("Categories & Channels"),
            name: "category",
            req: ["categories", "channels"],
            p: permissionFlags.manageChannels,
            render: renderChannels
        },
        {
            text: translateFunc.get("Roles"),
            name: "role",
            req: ["roles"],
            p: permissionFlags.manageRoles,
            render: renderRoles
        },
        {
            text: translateFunc.get("Users Manager"),
            req: ["users", "banUsers", "roles"],
            name: "usersManager",
            p: permissionFlags.banUser,
            render: renderUserRoleManager
        },
        {
            text: translateFunc.get("Emoji Manager"),
            name: "emoji",
            req: ["emojis"],
            p: permissionFlags.manageEmojis,
            render: renderEmojis
        },
        {
            text: translateFunc.get("Webhooks"),
            name: "webhook",
            req: ["webhooks"],
            p: permissionFlags.manageWebhooks,
            render: renderWebhooks
        },
    ]
    .map(category => {
        let isPerm = true;
        if(category.p && !isAdmin){
            if(!permissionFunc.hasPermission(vars.realm.permission, category.p)) isPerm = false;
        }

        function display(){
            changeDisplay({ [category.name]: true });
        }

        const button = document.createElement("button");
        button.className = "btn";
        button.textContent = category.text;
        button.disabled = !isPerm;
        if(isPerm){
            button.onclick = () => {
                const reqs = category.req;
                if(reqs){
                    const sections = [];
                    for(const req of reqs)
                        if(!settings[req]) sections.push(req);


                    if(sections.length > 0){
                        socket.emit("realm.settings.get", rs_data.realmId, sections, (data) => {
                            rs_data.settings = Object.assign(settings, data);
                            if(category.render) category.render();
                            display();
                        })
                    }else display();
                }else display();
            };
        }
        return button;
    });

    const categorySwitcherContainer = document.createElement("div");
    categorySwitcherContainer.className = "settings__categorySwitcher";
    categoryButtons.forEach(button => {
        categorySwitcherContainer.appendChild(button);
    });

    rs_data.container.insertAdjacentElement("afterbegin", addSeparator(undefined, 20));
    rs_data.container.insertAdjacentElement("afterbegin", categorySwitcherContainer);
}