import hub from "../../hub.js";
hub("settingsServer_nav");

import translateFunc from "../../utils/translate.js";
import vars from "../../var/var.js";
import permissionFunc, { permissionFlags } from "../../utils/perm.js";
import socket from "../../core/socket/ws.js";

export const changeDisplay = function(_this, options){
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
        const div = _this[`${category}Div`];
        div.style.display = displayOptions[category] ? "block" : "none";
    }
}

export const renderCategorySwitcher = function(_this){
    const isAdmin = permissionFunc.hasPermission(vars.realm.permission, permissionFlags.admin);
    const categoryButtons =
    [
        {
            text: translateFunc.get("Basic Settings"),
            name: "meta",
            req: ["meta"],
            p: permissionFlags.admin,
            render: _this.renderMeta.bind(_this)
        },
        {
            text: translateFunc.get("Categories & Channels"),
            name: "category",
            req: ["categories", "channels"],
            p: permissionFlags.manageChannels,
            render: _this.renderChannels.bind(_this)
        },
        {
            text: translateFunc.get("Roles"),
            name: "role",
            req: ["roles"],
            p: permissionFlags.manageRoles,
            render: _this.renderRoles.bind(_this)
        },
        {
            text: translateFunc.get("Users Manager"),
            req: ["users", "banUsers", "roles"],
            name: "usersManager",
            p: permissionFlags.banUser,
            render: _this.renderUserRoleManager.bind(_this)
        },
        {
            text: translateFunc.get("Emoji Manager"),
            name: "emoji",
            req: ["emojis"],
            p: permissionFlags.manageEmojis,
            render: _this.renderEmojis.bind(_this)
        },
        {
            text: translateFunc.get("Webhooks"),
            name: "webhook",
            req: ["webhooks"],
            p: permissionFlags.manageWebhooks,
            render: _this.renderWebhooks.bind(_this)
        },
    ]
    .map(category => {
        let isPerm = true;
        if(category.p && !isAdmin){
            if(!permissionFunc.hasPermission(vars.realm.permission, category.p)) isPerm = false;
        }

        function display(){
            _this.changeDisplay(_this, { [category.name]: true });
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
                        if(!_this.settings[req]) sections.push(req);


                    if(sections.length > 0){
                        socket.emit("realm.settings.get", _this.realmId, sections, (data) => {
                            _this.settings = Object.assign(_this.settings, data);
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

    _this.container.appendChild(categorySwitcherContainer);
    _this.addSeparator(_this.container, 20);
}