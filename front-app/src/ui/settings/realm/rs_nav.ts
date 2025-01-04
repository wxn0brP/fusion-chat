import hub from "../../../hub";
hub("rs/nav");

import translateFunc from "../../../utils/translate";
import permissionFunc, { PermissionFlags } from "../../../utils/perm";
import socket from "../../../core/socket/socket";
import rs_dataF from "./rs_var";

import { renderMeta } from "./rs_meta";
import { renderWebhooks } from "./rs_webhooks";
import { renderEmojis } from "./rs_emoji";
import { renderUserRoleManager } from "./rs_users";
import { renderRoles } from "./rs_roles";
import { renderChannels } from "./rs_channels";
import { addSeparator } from "./rs_utils";
import { Settings_rs__CategorySwitcherButton, settingsKeys, Settings_rs__SettingsNav } from "./types";

/**
 * Updates the display status of various sections in the UI based on the provided options.
 * Each section can be toggled between "block" and "none" display styles.
 */
export const changeDisplay = function (options: Settings_rs__SettingsNav) {
    const rs_data = rs_dataF();
    for (const category of settingsKeys) {
        const div = rs_data.html[category];
        div.style.display = options[category] ? "block" : "none";
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
export const renderCategorySwitcher = function () {
    const categoryButtonsBuilder: Settings_rs__CategorySwitcherButton[] =
        [
            {
                text: translateFunc.get("Basic Settings"),
                name: "meta",
                req: ["meta"],
                render: renderMeta
            },
            {
                text: translateFunc.get("Categories & Channels"),
                name: "category",
                req: ["categories", "channels"],
                p: PermissionFlags.ManageChannels,
                render: renderChannels
            },
            {
                text: translateFunc.get("Roles"),
                name: "role",
                req: ["roles"],
                p: PermissionFlags.ManageRoles,
                render: renderRoles
            },
            {
                text: translateFunc.get("Users Manager"),
                req: ["users", "banUsers", "roles"],
                name: "usersManager",
                p: PermissionFlags.BanUser,
                render: renderUserRoleManager
            },
            {
                text: translateFunc.get("Emoji Manager"),
                name: "emoji",
                req: ["emojis"],
                p: PermissionFlags.ManageEmojis,
                render: renderEmojis
            },
            {
                text: translateFunc.get("Webhooks"),
                name: "webhook",
                req: ["webhooks"],
                p: PermissionFlags.ManageWebhooks,
                render: renderWebhooks
            },
        ]

    const categoryButtons = categoryButtonsBuilder
        .map(category => {
            let isPerm = true;
            if (category.p && !permissionFunc.canAction(category.p)) isPerm = false;

            const button = document.createElement("button");
            button.className = "btn";
            button.textContent = category.text;
            button.disabled = !isPerm;
            if (isPerm) {
                button.onclick = () => {
                    categorySwitcherButtonOnClick(category);
                };
            }
            return button;
        });

    const categorySwitcherContainer = document.createElement("div");
    categorySwitcherContainer.className = "settings__categorySwitcher";
    categoryButtons.forEach(button => {
        categorySwitcherContainer.appendChild(button);
    });

    const rs_data = rs_dataF();
    rs_data.container.insertAdjacentElement("afterbegin", addSeparator(undefined, 20));
    rs_data.container.insertAdjacentElement("afterbegin", categorySwitcherContainer);
}

function categorySwitcherButtonOnClick(category: Settings_rs__CategorySwitcherButton) {
    const updateDisplay = () => changeDisplay({ [category.name]: true });

    const rs_data = rs_dataF();
    const currentSettings = rs_data.settings;

    const requiredSections = category.req;
    if (!requiredSections) return updateDisplay();

    const missingSections = requiredSections.filter(section => !currentSettings[section]);

    if (missingSections.length == 0) return updateDisplay();

    socket.emit("realm.settings.get", rs_data.realmId, missingSections, (fetchedData) => {
        rs_data.settings = { ...currentSettings, ...fetchedData };
        category.render?.();
        updateDisplay();
    });
}



