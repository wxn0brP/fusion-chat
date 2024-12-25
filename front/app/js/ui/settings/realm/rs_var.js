// @ts-check
import hub from "../../../hub.js";
hub("rs/var");

/**
 * @typedef {import('./types').Settings} Settings
 * @typedef {import('./types').Categories} Categories
 * @typedef {import('../../../utils/Id')} Id
 */

import { initCategoryElement } from "./rs_utils.js";

/**
 * Initializes a settings page for a realm.
 *
 * @param {HTMLElement} container the container element for the settings page.
 * @returns {Categories}
 */
function initCategories(container){
    return {
        meta: initCategoryElement(container),
        category: initCategoryElement(container),
        editChannel: initCategoryElement(container),
        role: initCategoryElement(container),
        editRole: initCategoryElement(container),
        usersManager: initCategoryElement(container),
        emoji: initCategoryElement(container),
        webhook: initCategoryElement(container),
        editWebhook: initCategoryElement(container),
    }
}

// default export, must set to work
const rs_data = {
    /** @type {Categories} */
    html: initCategories(document.createElement("div")),
    /** @type {HTMLElement} */
    container: document.createElement("div"),
    /** @type {Settings} */
    settings: {
        addons: {
            subscribedChannels: [],
        },
        meta: {
            name: "",
            owner: "",
            img: false
        },
        categories: [],
        channels: [],
        roles: [],
        users: [],
        emojis: [],
        webhooks: [],
        banUsers: []
    },
    /** @type {Id} */
    realmId: "",
    /** @type {object} */
    _this: {}
}

export default rs_data;

/**
 * Sets the data for the settings page.
 *
 * @param {object} self
 * @param {Settings} self.settings The settings data for the page.
 * @param {Id} self.realmId The id of the realm.
 * @param {HTMLElement} self.container The container element for the settings page.
 */
export function setData(self){
    const {
        /** @type {Settings} */
        settings,
        /** @type {Id} */
        realmId,
        /** @type {HTMLElement} */
        container
    } = self;

    rs_data.html = initCategories(container);
    rs_data.container = container;
    rs_data.settings = settings;
    rs_data.realmId = realmId;
    rs_data._this = self;
}