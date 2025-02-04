import hub from "../../../hub.js";
hub("rs/nav");
import LangPkg from "../../../utils/translate.js";
import permissionFunc, { PermissionFlags } from "../../../utils/perm.js";
import socket from "../../../core/socket/socket.js";
import rs_dataF from "./rs_var.js";
import { renderMeta } from "./rs_meta.js";
import { renderWebhooks } from "./rs_webhooks.js";
import { renderEmojis } from "./rs_emoji.js";
import { renderUserRoleManager } from "./rs_users.js";
import { renderRoles } from "./rs_roles.js";
import { renderChannels } from "./rs_channels.js";
import { addSeparator } from "./rs_utils.js";
import { settingsKeys } from "./types.js";
export const changeDisplay = function (options) {
    const rs_data = rs_dataF();
    for (const category of settingsKeys) {
        const div = rs_data.html[category];
        div.style.display = options[category] ? "block" : "none";
    }
};
export const renderCategorySwitcher = function () {
    const categoryButtonsBuilder = [
        {
            text: LangPkg.settings_realm.basic_settings,
            name: "meta",
            req: ["meta"],
            render: renderMeta
        },
        {
            text: LangPkg.settings_realm.categories_and_channels,
            name: "category",
            req: ["categories", "channels"],
            p: PermissionFlags.ManageChannels,
            render: renderChannels
        },
        {
            text: LangPkg.settings_realm.roles,
            name: "role",
            req: ["roles"],
            p: PermissionFlags.ManageRoles,
            render: renderRoles
        },
        {
            text: LangPkg.settings_realm.users_manager,
            req: ["users", "banUsers", "roles"],
            name: "usersManager",
            p: PermissionFlags.BanUser,
            render: renderUserRoleManager
        },
        {
            text: LangPkg.settings_realm.emoji_manager,
            name: "emoji",
            req: ["emojis"],
            p: PermissionFlags.ManageEmojis,
            render: renderEmojis
        },
        {
            text: LangPkg.settings_realm.webhooks.webhook,
            name: "webhook",
            req: ["webhooks"],
            p: PermissionFlags.ManageWebhooks,
            render: renderWebhooks
        },
    ];
    const categoryButtons = categoryButtonsBuilder
        .map(category => {
        let isPerm = true;
        if (category.p && !permissionFunc.canAction(category.p))
            isPerm = false;
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
};
function categorySwitcherButtonOnClick(category) {
    const updateDisplay = () => changeDisplay({ [category.name]: true });
    const rs_data = rs_dataF();
    const currentSettings = rs_data.settings;
    const requiredSections = category.req;
    if (!requiredSections)
        return updateDisplay();
    const missingSections = requiredSections.filter(section => !currentSettings[section]);
    if (missingSections.length == 0)
        return updateDisplay();
    socket.emit("realm.settings.get", rs_data.realmId, missingSections, (fetchedData) => {
        rs_data.settings = { ...currentSettings, ...fetchedData };
        category.render?.();
        updateDisplay();
    });
}
//# sourceMappingURL=rs_nav.js.map