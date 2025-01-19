import hub from "../../../hub";
import Id from "../../../types/Id";
import RealmSettingsManager from "./realmSettings";
import { initCategoryElement } from "./rs_utils";
import { Settings_rs__Categories, Settings } from "./types";
hub("rs/var");

/**
 * Initializes a settings page for a realm.
 */
function initCategories(container: HTMLElement) {
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

export interface Rs_data {
    html: Settings_rs__Categories,
    container: HTMLElement,
    settings: Settings,
    realmId: Id,
    _this: RealmSettingsManager
}

export let rs_data: Rs_data;
export default () => rs_data;

/**
 * Sets the data for the settings page.
 */
export function setData(self: RealmSettingsManager) {
    const {
        settings,
        realmId,
        container
    } = self;

    rs_data = {
        html: initCategories(container),
        container: container,
        settings: settings,
        realmId: realmId,
        _this: self,
    }
}